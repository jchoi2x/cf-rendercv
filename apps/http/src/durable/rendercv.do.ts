import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connection, ConnectionContext } from "agents";
import { McpAgent } from "agents/mcp";
import { Hono, type Context } from "hono";

import { callContainerService } from "../utils/call-container";
import { s3 } from "../utils/s3";
import { registerRenderscv } from "./mcp/rendercv/register";
import { registerWidgetUi } from "./mcp/widget-ui/register";
import type { AuthContext } from "./oauth/auth0";
import { createAuth0OAuthProvider } from "./oauth/auth0";

const proxyToContainer = async (c: Context<{ Bindings: Env }>) => {
  return callContainerService({
    path: c.req.path,
    method: c.req.method,
    name: "rendercv-app",
    body: c.req.method === "POST" ? await c.req.json() : undefined,
  });
};

type DocumentInput = {
  path: string;
  bucket?: string;
  createdAt: string;
  data: string;
};

export interface ResumeRecord {
  id: number;
  path: string;
  bucket: string;
  createdAt: string;
  data: string;
  pdfUrl: string;
  dataParsed?: unknown;
}
export interface RenderCvMcpAgent extends Omit<
  McpAgent<Env, unknown, AuthContext>,
  "server"
> {
  server: McpServer;

  addDocument(document: DocumentInput): void;
  getDocuments(): Promise<ResumeRecord[]>;
  getResumeById(id: number): ResumeRecord | null;
  renameResumeById(id: number, newName: string): Promise<ResumeRecord | null>;
  deleteResumeById(id: number): Promise<boolean>;
}

export class RendercvDo
  extends McpAgent<Env, unknown, AuthContext>
  implements RenderCvMcpAgent
{
  app = new Hono<{ Bindings: Env }>();

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

    this.app.post("/api/v1/generate", proxyToContainer);
    this.app.get("/swagger-ui", proxyToContainer);
    this.app.get("/openapi.json", proxyToContainer);
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

  async getDocuments(): Promise<ResumeRecord[]> {
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

    // if (fromDb.length > 0) {
    //   return fromDb;
    // }

    // const l = await this._storage.list({});

    // const list = await Promise.all(
    //   [...l.keys()].map(
    //     (key) => this._storage.get<ResumeRecord>(key) as Promise<ResumeRecord>,
    //   ),
    // );

    // return list;
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

  async renameResumeById(
    id: number,
    newName: string,
  ): Promise<ResumeRecord | null> {
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
    await s3.send(
      new CopyObjectCommand({
        Bucket: existing.bucket,
        CopySource: `${existing.bucket}/${existing.path}`,
        Key: newPath,
      }),
    );

    this.doSql.exec("UPDATE documents SET path = ? WHERE id = ?", newPath, id);

    // Best-effort cleanup; if this fails, the metadata is still correct.
    await s3.send(
      new DeleteObjectCommand({
        Bucket: existing.bucket,
        Key: existing.path,
      }),
    );

    return this.getResumeById(id);
  }

  async deleteResumeById(id: number): Promise<boolean> {
    const existing = this.getResumeById(id);
    if (!existing) return false;

    // Delete PDF object first (best effort).
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: existing.bucket,
          Key: existing.path,
        }),
      );
    } catch {
      // Even if S3 delete fails, remove the SQL record to keep metadata consistent.
    }

    this.doSql.exec("DELETE FROM documents WHERE id = ?", id);
    return true;
  }

  override async onStart() {
    return super.onStart();
  }

  override onClose(
    ctx: Connection<unknown>,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    return super.onClose(ctx, code, reason, wasClean);
  }

  override async init() {
    // register mcp tools, prompts and resources
    registerRenderscv(this);
    registerWidgetUi(this);
  }

  override async onConnect(
    ctx: Connection<unknown>,
    { request: req }: ConnectionContext,
  ) {
    // console.debug(`onConnect::${this.name}`, this.props);
    return super.onConnect(ctx, { request: req });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}

// export const RendercvOAuthProvider = createGoogleOAuthProvider(RendercvDo);
export const RendercvOAuthProvider = createAuth0OAuthProvider(RendercvDo);
