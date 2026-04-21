import { DeleteObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import YAML from "yaml";

import { s3 } from "../utils/s3";
import { typstFontStorageKey } from "./helpers/typst-storagekey";
import { registerRenderscv } from "./mcp/rendercv/register";
import { registerWidgetUi } from "./mcp/widget-ui/register";
import type { AuthContext } from "./oauth/auth0";
import { createAuth0OAuthProvider } from "./oauth/auth0";
import { Renderer } from "./rendercv/renderer/renderer";
import type { RenderCvDocumentPayload } from "./rendercv/templater/types";
import { getApp } from "./routes";
import type { DocumentInput, RenderCvMcpAgent, ResumeRecord } from "./types";
import { TypstCompilerManager } from "./typst/typst-compiler-manager";

export class RendercvDo
  extends McpAgent<Env, unknown, AuthContext>
  implements RenderCvMcpAgent
{
  private readonly renderer = new Renderer();
  private readonly compilerManager = new TypstCompilerManager({
    fontPersistence: {
      loadFont: async (url) => {
        const key = await typstFontStorageKey(url);
        const raw = await this._storage.get<ArrayBuffer | string>(key);
        if (raw == null) {
          return undefined;
        }
        if (typeof raw === "string") {
          return undefined;
        }
        return new Uint8Array(raw);
      },
      onFontLoaded: (url, bytes) => {
        this.ctx.waitUntil(
          (async () => {
            const key = await typstFontStorageKey(url);
            await this._storage.put(key, bytes);
          })(),
        );
      },
    },
  });

  app = getApp(this);

  server = new McpServer({
    name: "RenderCV API",
    version: "1.0.0",
  });

  doSql: SqlStorage;
  private workerEnv: Env;
  private _storage: DurableObjectStorage;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.workerEnv = env;

    this.doSql = state.storage.sql;
    this._storage = state.storage;

    this.doSql.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        bucket TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        data TEXT
      );
    `);

    this.app.use("*", (c) => super.fetch(c.req.raw));
  }

  private toResumeRecord(row: {
    id: number;
    path: string;
    bucket: string | null;
    createdAt: string;
    data: string;
  }): ResumeRecord {
    let dataParsed: unknown = undefined;
    try {
      dataParsed = JSON.parse(row.data);
    } catch {
      // Keep it as raw `data` if it's not valid JSON.
    }

    return {
      id: row.id,
      path: row.path,
      bucket: row.bucket ?? this.workerEnv.S3_BUCKET,
      createdAt: row.createdAt,
      data: row.data,
      pdfUrl: `${this.workerEnv.S3_PUBLIC_URL}/${row.path}`,
      dataParsed,
    };
  }

  parseBody(body: string) {
    try {
      return YAML.parse(body);
    } catch {
      try {
        return JSON.parse(body);
      } catch {
        throw new Error("Invalid body");
      }
    }
  }

  async renderCvTypstSource(
    payload: string,
  ): Promise<{ ok: true; source: string } | { ok: false; error: string }> {
    try {
      const obj = this.parseBody(payload);
      const result = await this.renderer.buildTypstSource(
        obj as RenderCvDocumentPayload,
      );

      return {
        ok: true,
        source: result.trimEnd(),
      };
    } catch (error) {
      console.error("[RendercvDO] compilation of typst sourcefailed:", error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        error: message,
      };
    }
  }

  async renderCvTypstPdf(
    payload: string,
  ): Promise<
    | { ok: true; pdf: Uint8Array<ArrayBufferLike> }
    | { ok: false; error: string }
  > {
    try {
      const src = await this.renderCvTypstSource(payload);
      if (!src.ok) {
        return {
          ok: false,
          error: src.error,
        };
      }

      const { source } = src;
      const result = await this.compilerManager.compilePdf(5, source);
      if (result.ok) {
        return {
          ok: true,
          pdf: result.data,
        };
      } else {
        return {
          ok: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error("[RendercvDO] compilation of typst pdf failed:", error);
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        error: message,
      };
    }
  }

  addDocument(document: DocumentInput) {
    this.doSql.exec(
      "INSERT INTO documents (path, bucket, created_at, data) VALUES (?, ?, ?, ?)",
      document.path,
      document.bucket ?? this.workerEnv.S3_BUCKET,
      document.createdAt,
      document.data,
    );
    this.ctx.waitUntil(this._storage.put(document.path, document.data));
  }

  getDocuments(): ResumeRecord[] {
    const documents = this.doSql.exec(`
      SELECT
        id,
        path,
        bucket,
        created_at as createdAt,
        data
      FROM documents
      ORDER BY id DESC;
    `);
    const fromDb = documents
      .toArray()
      .map((row) => this.toResumeRecord(row as any));

    return fromDb;
  }

  getResumeById(id: number): ResumeRecord | null {
    const cursor = this.doSql.exec(
      `
      SELECT
        id,
        path,
        bucket,
        created_at as createdAt,
        data
      FROM documents
      WHERE id = ?;
    `,
      id,
    );
    const rows = cursor.toArray();
    if (!rows.length) return null;
    return this.toResumeRecord(rows[0] as any);
  }

  renameResumeById(id: number, newName: string): ResumeRecord | null {
    const existing = this.getResumeById(id);
    if (!existing) return null;

    const normalized = newName.trim();
    if (!normalized) throw new Error("newName must be non-empty");

    const finalName = normalized.toLowerCase().endsWith(".pdf")
      ? normalized
      : `${normalized}.pdf`;

    // Preserve the existing folder/prefix, only replace the filename.
    const lastSlash = existing.path.lastIndexOf("/");
    const prefix = lastSlash >= 0 ? existing.path.slice(0, lastSlash) : "";
    const newPath = prefix ? `${prefix}/${finalName}` : finalName;

    // Move object in R2 by Copy + Delete.
    try {
      this.ctx.waitUntil(
        s3.send(
          new CopyObjectCommand({
            Bucket: existing.bucket,
            CopySource: `${existing.bucket}/${existing.path}`,
            Key: newPath,
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to copy S3 object:", error);
    } finally {
      this.doSql.exec(
        "UPDATE documents SET path = ? WHERE id = ?",
        newPath,
        id,
      );

      // Best-effort cleanup; if this fails, the metadata is still correct.
      this.ctx.waitUntil(
        s3.send(
          new DeleteObjectCommand({
            Bucket: existing.bucket,
            Key: existing.path,
          }),
        ),
      );
    }
    return this.getResumeById(id);
  }

  deleteResumeById(id: number): boolean {
    const existing = this.getResumeById(id);
    if (!existing) return false;

    try {
      // Delete PDF object
      this.ctx.waitUntil(
        s3.send(
          new DeleteObjectCommand({
            Bucket: existing.bucket,
            Key: existing.path,
          }),
        ),
      );
    } catch (error) {
      // Even if S3 delete fails, remove the SQL record to keep metadata consistent.
      console.error("Failed to delete S3 object:", error);
    } finally {
      this.doSql.exec("DELETE FROM documents WHERE id = ?", id);
    }

    return true;
  }

  override async init() {
    // register mcp tools, prompts and resources
    registerRenderscv(this);
    registerWidgetUi(this);
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}

// export const RendercvOAuthProvider = createGoogleOAuthProvider(RendercvDo);
export const RendercvOAuthProvider = createAuth0OAuthProvider(RendercvDo);
