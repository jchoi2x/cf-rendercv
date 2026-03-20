import type { Context } from "hono";
import { createFactory } from "hono/factory";

type E = {
  Bindings: Env;
  Variables: { key: string };
};

const c = createFactory<E>();

const getRateLimitKey = (c: Context<E>) => {
  // use authorization header if present, otherwise if cf ip address use it, otherwise just url

  const authorization = c.req.header("authorization");
  const cfIpAddress = c.req.header("CF-Connecting-IP");

  const prefix = authorization || cfIpAddress || "";

  return `${prefix}:${c.req.method}:${c.req.path}`;
};

export const rateLimiterMiddleware = c.createMiddleware(async (c, next) => {
  const rateLimit = c.env.RATE_LIMITER;
  const key = getRateLimitKey(c);
  const { success } = await rateLimit.limit({ key });
  if (!success) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }
  c.set("key", key);
  return next();
});
