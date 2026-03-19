import { beforeEach, describe, it, expect, vi } from "vitest";

describe("durable/container.do.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("covers DockerRendercvApp env vars and hooks", async () => {
    vi.doMock("@cloudflare/containers", () => ({
      Container: class {
        constructor(_ctx: unknown, _env: unknown, _options?: unknown) {}
      },
    }));

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    const { DockerRendercvApp } = await import("../container.do");
    const c = new DockerRendercvApp({} as any, {} as Env);

    expect(c.defaultPort).toBe(8080);
    expect(c.envVars.S3_BUCKET).toBe("bucket");

    c.onStart();
    c.onStop();
    c.onError(new Error("x"));

    expect(info).toHaveBeenCalled();
    expect(err).toHaveBeenCalled();
  });
});
