import { describe, it, expect, vi } from "vitest";

describe("src/index.ts app wiring", () => {

  it("proxies matched POST routes to MCP durable object stub", async () => {
    vi.resetModules();

    const showRoutesMock = vi.fn();
    vi.doMock("hono/dev", () => ({ showRoutes: showRoutesMock }));

    const providerFetch = vi.fn().mockResolvedValue(new Response("oauth"));
    vi.doMock("../durable", () => ({
      RendercvDo: class {},
      DockerRendercvApp: class {},
      RendercvOAuthProvider: { fetch: providerFetch },
    }));

    const { default: app } = await import("../index");

    const stubFetch = vi.fn().mockResolvedValue(new Response("do"));
    const env = {
      MCP_OBJECT: {
        idFromName: (_name: string) => "id",
        get: (_id: any) => ({ fetch: stubFetch }),
      },
      RATE_LIMITER: {
        limit: async () => ({ success: true }),
      },
    } as any;

    const ok = await app.fetch(
      new Request("http://localhost/api/v3/rendercv/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      }),
      env,
      {} as any,
    );
    expect(ok.status).toBe(200);
    const txt = await ok.text();
    expect(txt).toBe("do");

    expect(stubFetch).toHaveBeenCalledTimes(1);

    const other = await app.fetch(new Request("http://localhost/anything"), env, {} as any);
    expect(other.status).toBe(200);
    expect(await other.text()).toBe("oauth");
    expect(providerFetch).toHaveBeenCalled();

    const getProxy = await app.fetch(new Request("http://localhost/openapi.json"), env, {} as any);
    expect(getProxy.status).toBe(200);
  });
});
