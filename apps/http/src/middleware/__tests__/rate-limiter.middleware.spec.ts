import { Hono } from "hono";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { rateLimiterMiddleware } from "../rate-limiter.middleware";

describe("rateLimiterMiddleware", () => {
  const limit = vi.fn<(args: { key: string }) => Promise<{ success: boolean }>>();

  beforeEach(() => {
    limit.mockReset();
    limit.mockResolvedValue({ success: true });
  });

  function appWithMiddleware() {
    return new Hono<{ Bindings: Env; Variables: { key: string } }>()
      .use(rateLimiterMiddleware)
      .get("/foo", (c) => c.json({ key: c.get("key") }))
      .post("/bar/baz", (c) => c.json({ key: c.get("key") }));
  }

  function testEnv(): Env {
    return { RATE_LIMITER: { limit } } as unknown as Env;
  }

  it("calls limit with auth header in the key when present", async () => {
    const app = appWithMiddleware();
    const res = await app.fetch(
      new Request("http://test/foo", {
        method: "GET",
        headers: { authorization: "Bearer token" },
      }),
      testEnv(),
      {} as ExecutionContext,
    );

    expect(limit).toHaveBeenCalledTimes(1);
    expect(limit.mock.calls[0]?.[0]).toEqual({
      key: "Bearer token:GET:/foo",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ key: "Bearer token:GET:/foo" });
  });

  it("uses CF-Connecting-IP in the key when there is no authorization", async () => {
    const app = appWithMiddleware();
    await app.fetch(
      new Request("http://test/foo", {
        method: "GET",
        headers: { "CF-Connecting-IP": "1.2.3.4" },
      }),
      testEnv(),
      {} as ExecutionContext,
    );

    expect(limit.mock.calls[0]?.[0]).toEqual({
      key: "1.2.3.4:GET:/foo",
    });
  });

  it("uses an empty prefix when neither authorization nor CF-Connecting-IP is set", async () => {
    const app = appWithMiddleware();
    await app.fetch(new Request("http://test/bar/baz", { method: "POST" }), testEnv(), {} as ExecutionContext);

    expect(limit.mock.calls[0]?.[0]).toEqual({
      key: ":POST:/bar/baz",
    });
  });

  it("returns 429 with a JSON error when limit reports failure", async () => {
    limit.mockResolvedValueOnce({ success: false });
    const app = appWithMiddleware();
    const res = await app.fetch(
      new Request("http://test/foo", { method: "GET" }),
      testEnv(),
      {} as ExecutionContext,
    );

    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "Rate limit exceeded" });
  });

  it("prefers authorization over CF-Connecting-IP for the key prefix", async () => {
    const app = appWithMiddleware();
    await app.fetch(
      new Request("http://test/foo", {
        method: "GET",
        headers: {
          authorization: "Basic x",
          "CF-Connecting-IP": "9.9.9.9",
        },
      }),
      testEnv(),
      {} as ExecutionContext,
    );

    expect(limit.mock.calls[0]?.[0]?.key.startsWith("Basic x:")).toBe(true);
    expect(limit.mock.calls[0]?.[0]?.key).toBe("Basic x:GET:/foo");
  });
});
