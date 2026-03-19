import { env } from "./workers-env";
import { getContainer } from "@cloudflare/containers";

export type CallContainerServiceOptions = {
  path: string;
  body?: unknown;
  method?: string;
  name?: string;
};

export async function callContainerService(
  opts: CallContainerServiceOptions,
): Promise<Response> {
  const { path, body, method = "POST", name = "rendercv-http" } = opts;
  const container = getContainer(env.DOCKER_RENDERCV_APP, name);

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
