import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpAgent } from "agents/mcp";

import type { AuthContext } from "./oauth/auth0";

export type DocumentInput = {
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
  getDocuments(): ResumeRecord[];
  getResumeById(id: number): ResumeRecord | null;
  renameResumeById(id: number, newName: string): ResumeRecord | null;
  deleteResumeById(id: number): boolean;
  renderCvTypstSource(
    payload: string,
  ): Promise<{ ok: true; source: string } | { ok: false; error: string }>;
  renderCvTypstPdf(
    payload: string,
  ): Promise<
    | { ok: true; pdf: Uint8Array<ArrayBufferLike> }
    | { ok: false; error: string }
  >;
}
