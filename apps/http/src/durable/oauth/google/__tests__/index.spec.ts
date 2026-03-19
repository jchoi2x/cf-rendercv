import { describe, it, expect, vi, beforeEach } from "vitest";

describe("google oauth index", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("re-exports handler and provider", async () => {
    vi.doMock("../google.handler", () => ({ GoogleHandler: { ok: true } }));
    vi.doMock("../google.provider", () => ({
      createGoogleOAuthProvider: () => ({ ok: true }),
    }));

    const mod = await import("../index");
    expect(mod.GoogleHandler).toBeTruthy();
    expect(mod.createGoogleOAuthProvider).toBeTruthy();
  });
});

