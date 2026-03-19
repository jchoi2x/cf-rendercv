import { McpAgent, getMcpAuthContext } from "agents/mcp";
import { Hono, type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callContainerService } from "../utils/call-container";

import { registerWidgetUi } from "./mcp/widget-ui/register";
import { registerRenderscv } from "./mcp/rendercv/register";
import type { Connection, ConnectionContext } from "agents";
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

type AuthContext = {
  claims: { sub: string; name: string; email: string };
  permissions: string[];
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
    console.debug(`onStart::${this.name}`, this.props);
    return super.onStart();
  }
  onClose(
    ctx: Connection<unknown>,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    console.debug(`onClose::${this.name}`, this.props);
    return super.onClose(ctx, code, reason, wasClean);
  }

  override async init() {
    const auth = getMcpAuthContext();

    console.debug(`init::${this.name}`, auth);
    // register mcp tools, prompts and resources
    registerRenderscv(this.server);
    registerWidgetUi(this.server);
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
