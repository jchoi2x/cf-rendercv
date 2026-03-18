import { McpAgent } from "agents/mcp";
import { Hono,type Context } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callContainerService } from "../utils/call-container";

import { registerWidgetUi } from "./mcp/widget-ui/register";
import { registerRenderscv } from "./mcp/rendercv/register";

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

  override async init() {
    // register mcp tools, prompts and resources
    registerRenderscv(this.server);
    registerWidgetUi(this.server);
  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }

}