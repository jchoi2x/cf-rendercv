import {
  RendercvDo,
  DockerRendercvApp,
  RendercvOAuthProvider,
} from "./durable";
import { Hono, type Context } from "hono";
import { RenderCvDocument } from "@cf-rendercv/contracts/entities";
import { showRoutes } from "hono/dev";

const app = new Hono<{ Bindings: Env }>();

const pathMathes = ["/api/v1/generate", "/swagger-ui", "/openapi.json"];
// a function to get the rate limit key
const getRateLimitKey = (c: Context) => {
  // use authorization header if present, otherwise if cf ip address use it, otherwise just url

  const authorization = c.req.header("authorization");
  const cfIpAddress = c.req.header("CF-Connecting-IP");

  const prefix = authorization || cfIpAddress || "";

  return `${prefix}:${c.req.method}:${c.req.path}`;
};

// rate limit the request
app.use(async (c, next) => {
  const rateLimit = c.env.RATE_LIMITER;
  const key = getRateLimitKey(c);

  console.debug(`rate limit key: ${key}`);
  const result = await rateLimit.limit({
    key,
  });

  if (!result.success) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }
  return next();
});

app.all("*", async (c, next) => {
  const path = c.req.path;
  if (!pathMathes.includes(path)) {
    return next();
  }

  const clonedRequest = c.req.raw.clone();

  let request = new Request(clonedRequest, {});

  // if POST /api/v1/generate, validate the body
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
