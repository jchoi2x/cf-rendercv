import type { Handler } from "hono";
import { Hono } from "hono";

import { RendercvDo, RendercvOAuthProvider } from "./durable";
import { rateLimiterMiddleware } from "./middleware/rate-limiter.middleware";

const app = new Hono<{ Bindings: Env; Variables: { key: string } }>();

const getRoutePathMathes = ["/health", "/swagger-ui", "/openapi.json"];
const postRoutePathMathes = [
  "/api/v3/rendercv/typst",
  "/api/v3/rendercv/render",
];

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

for (const path of getRoutePathMathes) {
  app.get(path, proxyToDurable);
}
for (const path of postRoutePathMathes) {
  app.post(path, proxyToDurable);
}

// delegate to the OAuth provider
app.use(async (c) => {
  return RendercvOAuthProvider.fetch(
    c.req.raw,
    c.env,
    c.executionCtx as ExecutionContext<unknown>,
  );
});

export default app;
export { RendercvDo };
