import {
  RendercvDo,
  DockerRendercvApp,
  RendercvOAuthProvider,
} from "./durable";
import { Hono } from "hono";
import { RenderCvDocument } from "@cf-rendercv/contracts/entities";
import { showRoutes } from "hono/dev";
import { rateLimiterMiddleware } from "./middleware/rate-limiter.middleware";

const app = new Hono<{ Bindings: Env }>();

const pathMathes = ["/swagger-ui", "/openapi.json"];

app.get("/health", (c) => c.json({ ok: true }));

// rate limit the request
app.use(rateLimiterMiddleware);

app.post("/api/v1/generate", async (c) => {
  const requestForStub = c.req.raw.clone();
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

  const id = c.env.MCP_OBJECT.idFromName("rendercv");
  const stub = c.env.MCP_OBJECT.get(id);
  const subject = await stub.fetch(requestForStub);
  return subject;
});

for (const i of pathMathes) {
  app.get(i, async (c) => {
    const id = c.env.MCP_OBJECT.idFromName("rendercv");

    const stub = c.env.MCP_OBJECT.get(id);
    const subject = await stub.fetch(c.req.raw.clone());
    return subject;
  });
}

// delegate to the OAuth provider
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
