import { DurableObject } from "cloudflare:workers";
import { getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class RendercvDo extends DurableObject<Env> {
  app = new Hono();
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.app.post('*', async (c) => this.generateCV(await c.req.json()));
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