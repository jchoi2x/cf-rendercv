import { McpAgent } from "agents/mcp";
import { getContainer } from "@cloudflare/containers";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { RenderCvDocument } from "@cf-rendercv/contracts";

export class RendercvDo extends McpAgent<Env, Record<string, string>, {}> {
  app = new Hono<{ Bindings: Env }>();

  server = new McpServer({
    name: "RenderCV API",
    version: "1.0.0",
  });
  
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.app.post('/api/v1/generate', async (c) => {
      return this.generateCV(await c.req.json())
    });

    this.app.use('*', (c) => super.fetch(c.req.raw));
  }

  override async init() {

    // check if the authenticated user has a cookie set
    this.server.registerTool('rendercv', {
      title: "rendercv generate",
      description: "Generate a CV from a RenderCV YAML payload",
      inputSchema: {
        content: RenderCvDocument,
      },
    }, async ({ content }) => {

      const response = await this.generateCV(content);
      const data = await response.json<{ url: string, filename: string }>();
      
      // get the base64 encoded pdf from the response body
      // const pdf = await response.text();
      // const base64Pdf = Buffer.from(pdf).toString('base64');
      // const uuid = crypto.randomUUID();
      return {
        content: [
          {
            type: "text",
            text: data.url
          },
        ],
      };
    });

  }

  async fetch(request: Request) {
    return this.app.fetch(request);
  }

  private async generateCV(body: unknown): Promise<Response> {
    return this.callContainerService("/api/v1/generate", body, "POST", "rendercv-app");
  }

  private async callContainerService(
    path: string,
    body: unknown,
    method: string = "POST",
    name: string = "rendercv-http"
  ): Promise<Response> {
    const container = getContainer(this.env.DOCKER_RENDERCV_APP, name);

    const headers = new Headers({
      "Content-Type": "application/json",
    });


    const options: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "HEAD" && body) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    try {
      const request = new Request(`http://container${path}`, options);
      const response = await container.fetch(request);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to call container service: ${error.message}`);
    }
  }
}