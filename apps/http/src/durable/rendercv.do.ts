import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Connection, ConnectionContext } from "agents";
import { McpAgent } from "agents/mcp";
import { Hono, type Context } from "hono";

import { callContainerService } from "../utils/call-container";
import { registerRenderscv } from "./mcp/rendercv/register";
import { registerWidgetUi } from "./mcp/widget-ui/register";
import type { AuthContext } from "./oauth/auth0";
import { createAuth0OAuthProvider } from "./oauth/auth0";

const proxyToContainer = async (c: Context<{ Bindings: Env }>) => {
  let payload = {};
  if (c.req.method === "POST") {
    payload = await c.req.json();
  }

  return callContainerService({
    path: c.req.path,
    method: c.req.method,
    name: "rendercv-app",
    body: c.req.method === "POST" ? payload : undefined,
  });
};

export class RendercvDo extends McpAgent<Env, unknown, AuthContext> {
  app = new Hono<{ Bindings: Env }>();

  server = new McpServer({
    name: "RenderCV API",
    version: "1.0.0",
  });

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    this.app.post("/api/v1/generate", proxyToContainer);
    this.app.get("/swagger-ui", proxyToContainer);
    this.app.get("/openapi.json", proxyToContainer);
    this.app.use("*", (c) => super.fetch(c.req.raw));
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
    registerRenderscv(this.server, this.props);
    registerWidgetUi(this.server, this.props);
  }

  override async onConnect(
    ctx: Connection<unknown>,
    { request: req }: ConnectionContext,
  ) {
    console.debug(`onConnect::${this.name}`, this.props);
    return super.onConnect(ctx, { request: req });
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }
}

// export const RendercvOAuthProvider = createGoogleOAuthProvider(RendercvDo);
export const RendercvOAuthProvider = createAuth0OAuthProvider(RendercvDo);
