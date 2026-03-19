import {
  RendercvDo,
  DockerRendercvApp,
  RendercvOAuthProvider,
} from "./durable";
import { Hono } from "hono";
import { RenderCvDocument } from "@cf-rendercv/contracts/entities";
import { showRoutes } from "hono/dev";

const app = new Hono<{ Bindings: Env }>();

const pathMathes = ["/api/v1/generate", "/swagger-ui", "/openapi.json"];

app.all("*", async (c, next) => {
  const path = c.req.path;
  if (!pathMathes.includes(path)) {
    return next();
  }

  const clonedRequest = c.req.raw.clone();

  let request = new Request(clonedRequest, {});

  if (c.req.raw.method === "POST") {
    const body = await c.req.json();
    const { success, data, error } = RenderCvDocument.safeParse(body);
    if (!success) {
      console.error({
        error,
        success,
        data,
      });
      return c.json({ error: error.message }, 400);
    }

    request = new Request(request, {
      body: JSON.stringify(body),
    });
  }

  const id = c.env.MCP_OBJECT.idFromName("rendercv");

  const stub = c.env.MCP_OBJECT.get(id);
  const subject = await stub.fetch(request);
  return subject;
});

app.use(async (c) => {
  return RendercvOAuthProvider.fetch(
    c.req.raw,
    c.env,
    c.executionCtx as ExecutionContext<unknown>,
  );
});

showRoutes(app);
export default app;
export { RendercvDo, DockerRendercvApp };
