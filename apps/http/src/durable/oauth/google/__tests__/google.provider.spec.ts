import { describe, it, expect, vi, beforeEach } from "vitest";

describe("createGoogleOAuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("constructs OAuthProvider with expected wiring", async () => {
    const OAuthProviderMock = vi.fn(function (this: any, opts: any) {
      this.opts = opts;
    });

    vi.doMock("@cloudflare/workers-oauth-provider", () => ({
      OAuthProvider: OAuthProviderMock,
    }));

    vi.doMock("../google.handler", () => ({
      GoogleHandler: { mocked: true },
    }));

    const serveSSE = vi.fn(() => ({ kind: "sse" }));
    const serve = vi.fn(() => ({ kind: "http" }));

    const McpAgent = {
      serveSSE,
      serve,
    };

    const { createGoogleOAuthProvider } = await import("../google.provider");
    const provider: any = createGoogleOAuthProvider(McpAgent as any);

    expect(OAuthProviderMock).toHaveBeenCalledTimes(1);
    const opts = (provider as any).opts;
    expect(opts.authorizeEndpoint).toBe("/authorize");
    expect(opts.clientRegistrationEndpoint).toBe("/register");
    expect(opts.tokenEndpoint).toBe("/token");
    expect(opts.defaultHandler).toEqual({ mocked: true });

    expect(serveSSE).toHaveBeenCalledWith("/sse", { binding: "MCP_OBJECT" });
    expect(serve).toHaveBeenCalledWith("/mcp", { binding: "MCP_OBJECT" });
    expect(opts.apiHandlers).toEqual({
      "/sse": { kind: "sse" },
      "/mcp": { kind: "http" },
    });
  });
});

