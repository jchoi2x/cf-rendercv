import { describe, it, expect, vi, beforeEach } from "vitest";

const OAuthProviderMock = vi.fn();

vi.mock("@cloudflare/workers-oauth-provider", () => ({
  OAuthProvider: function OAuthProvider(this: any, opts: any) {
    OAuthProviderMock(opts);
    return { opts };
  },
}));

describe("createAuth0OAuthProvider", () => {
  beforeEach(() => {
    OAuthProviderMock.mockReset();
  });

  it("wires OAuthProvider with expected endpoints and handlers", async () => {
    const { createAuth0OAuthProvider } = await import("../auth0.provider");

    const serve = vi.fn(() => ({ fetch: vi.fn() }));
    const serveSSE = vi.fn(() => ({ fetch: vi.fn() }));

    const McpAgent = {
      serve,
      serveSSE,
    } as any;

    const provider = createAuth0OAuthProvider(McpAgent);
    expect(provider).toBeTruthy();

    expect(OAuthProviderMock).toHaveBeenCalledTimes(1);
    const opts = OAuthProviderMock.mock.calls[0]![0];

    expect(opts.authorizeEndpoint).toBe("/authorize");
    expect(opts.clientRegistrationEndpoint).toBe("/register");
    expect(opts.tokenEndpoint).toBe("/token");
    expect(typeof opts.apiHandler?.fetch).toBe("function");
    expect(typeof opts.apiHandlers["/sse"]?.fetch).toBe("function");
    expect(typeof opts.apiHandlers["/mcp"]?.fetch).toBe("function");

    expect(serve).toHaveBeenCalledWith("/mcp");
    expect(serve).toHaveBeenCalledWith("/mcp", { binding: "MCP_OBJECT" });
    expect(serveSSE).toHaveBeenCalledWith("/sse", { binding: "MCP_OBJECT" });

    expect(opts.defaultHandler).toBeTruthy();
    expect(opts.tokenExchangeCallback).toBeTruthy();
  });
});
