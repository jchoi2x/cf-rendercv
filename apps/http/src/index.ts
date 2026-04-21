import type { Handler } from "hono";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";

import { RendercvDo, RendercvOAuthProvider } from "./durable";
import { rateLimiterMiddleware } from "./middleware/rate-limiter.middleware";

const app = new Hono<{ Bindings: Env; Variables: { key: string } }>();

const pathMathes = ["/swagger-ui", "/openapi.json"];

app.get("/health", (c) => c.json({ ok: true }));

// rate limit the request
app.use(rateLimiterMiddleware);

const proxyToDurable: Handler<
  { Bindings: Env; Variables: { key: string } },
  any,
  any
> = async (c) => {
  const requestForStub = c.req.raw.clone();

  const key = c.get("key");
  const id = c.env.MCP_OBJECT.idFromName(key);
  const stub = c.env.MCP_OBJECT.get(id);
  const subject = await stub.fetch(requestForStub);
  return subject;
};

app.post("/api/v2/generate", proxyToDurable);
app.post("/api/v3/rendercv/typst", proxyToDurable);
app.post("/api/v3/rendercv/render", proxyToDurable);
app.post("/api/v3/generate", proxyToDurable);
app.post("/api/v1/generate", proxyToDurable);

for (const i of pathMathes) {
  app.get(i, async (c) => {
    const key = c.get("key");
    const id = c.env.MCP_OBJECT.idFromName(key);
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
export { RendercvDo };
