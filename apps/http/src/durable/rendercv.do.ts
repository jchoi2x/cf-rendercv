import { McpAgent } from "agents/mcp";
import { Hono,type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callContainerService } from "../utils/call-container";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

import { registerWidgetUi } from "./mcp/widget-ui/register";
import { registerRenderscv } from "./mcp/rendercv/register";
import { GoogleHandler } from "./oauth/handlers";
import type { Connection, ConnectionContext } from "agents";

const proxyToContainer = async (c: Context<{ Bindings: Env }>) => {
  let payload = {};
  if (c.req.method === 'POST') {
    payload = await c.req.json();
  }

  return callContainerService({
    path: c.req.path,
    method: c.req.method,
    name: "rendercv-app",
    body: c.req.method === 'POST' ? payload : undefined,
  });
};

export class RendercvDo extends McpAgent<Env, Record<string, string>, {}> {
  app = new Hono<{ Bindings: Env }>();

  server = new McpServer({
    name: "RenderCV API",
    version: "1.0.0",
  });

  
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    this.app.post('/api/v1/generate', proxyToContainer);
    this.app.get('/swagger-ui', proxyToContainer);
    this.app.get('/openapi.json', proxyToContainer);
    this.app.use('*', (c) => super.fetch(c.req.raw));
  }

  override async onStart() {
    console.debug(`onStart::${this.name}`);
    return super.onStart();
  }
  onClose(ctx: Connection<unknown>, code: number, reason: string, wasClean: boolean) {
    console.debug(`onClose::${this.name}`);
    return super.onClose(ctx, code, reason, wasClean);
  }


  override async init() {
    console.debug(`init::${this.name}`);
    // register mcp tools, prompts and resources
    registerRenderscv(this.server);
    registerWidgetUi(this.server);
  }

  override async onConnect(ctx: Connection<unknown>, { request: req }: ConnectionContext) {
    console.debug(`onConnect::${this.name}`);
    return super.onConnect(ctx, { request: req });
  }


  async fetch(request: Request) {
    return this.app.fetch(request);
  }

}

export const RendercvOAuthProvider = new OAuthProvider({
  // NOTE - during the summer 2025, the SSE protocol was deprecated and replaced by the Streamable-HTTP protocol
  // https://developers.cloudflare.com/agents/model-context-protocol/transport/#mcp-server-with-authentication
  apiHandlers: {
    "/sse": RendercvDo.serveSSE("/sse", { binding: "MCP_OBJECT" }),
    "/mcp": RendercvDo.serve("/mcp", { binding: "MCP_OBJECT" }),
  },

  authorizeEndpoint: "/authorize",
  clientRegistrationEndpoint: "/register",
  defaultHandler: GoogleHandler as any,
  tokenEndpoint: "/token",
});