import { describe, it, expect, vi, beforeEach } from "vitest";

function installBase64Polyfills() {
  // Node env used by coverage config doesn't provide atob/btoa.
  vi.stubGlobal("btoa", (input: string) =>
    Buffer.from(input, "utf8").toString("base64"),
  );
  vi.stubGlobal("atob", (input: string) =>
    Buffer.from(input, "base64").toString("utf8"),
  );
}

describe("GoogleHandler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    installBase64Polyfills();
  });

  it("GET /authorize returns 400 for invalid request", async () => {
    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(() => "https://example.com/auth"),
      exchangeCodeForTokens: vi.fn(),
      fetchGoogleUserInfo: vi.fn(),
    }));

    const { GoogleHandler } = await import("../google.handler");

    const OAUTH_PROVIDER = {
      parseAuthRequest: vi.fn(async () => ({ clientId: undefined })),
      completeAuthorization: vi.fn(),
    };

    const req = new Request("https://svc/authorize", { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER,
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid request");
  });

  it("GET /authorize redirects to Google with encoded state", async () => {
    const getGoogleAuthorizeUrl = vi.fn((opts: any) => {
      const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      for (const [k, v] of Object.entries(opts)) u.searchParams.set(k, String(v));
      return u.toString();
    });

    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl,
      exchangeCodeForTokens: vi.fn(),
      fetchGoogleUserInfo: vi.fn(),
    }));

    const { GoogleHandler } = await import("../google.handler");

    const oauthReqInfo = {
      clientId: "client-1",
      scope: "s1",
      redirectUri: "https://mcp.example/callback",
    };

    const OAUTH_PROVIDER = {
      parseAuthRequest: vi.fn(async () => oauthReqInfo),
      completeAuthorization: vi.fn(),
    };

    const req = new Request("https://svc/authorize", { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER,
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(302);
    const location = res.headers.get("location");
    expect(location).toBeTruthy();

    const u = new URL(location!);
    expect(u.origin).toBe("https://accounts.google.com");

    // Validate state round-trip
    const encodedState = u.searchParams.get("state");
    expect(encodedState).toBeTruthy();
    const decoded = JSON.parse((globalThis as any).atob(encodedState!));
    expect(decoded).toEqual(oauthReqInfo);

    // Ensure redirect URI points back to this service callback
    expect(u.searchParams.get("redirect_uri")).toBe("https://svc/callback");
    expect(u.searchParams.get("client_id")).toBe("cid");
    expect(u.searchParams.get("scope")).toBe("openid email profile");
  });

  it("GET /callback returns 400 when code/state missing", async () => {
    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(),
      exchangeCodeForTokens: vi.fn(),
      fetchGoogleUserInfo: vi.fn(),
    }));

    const { GoogleHandler } = await import("../google.handler");

    const OAUTH_PROVIDER = {
      parseAuthRequest: vi.fn(),
      completeAuthorization: vi.fn(),
    };

    const req = new Request("https://svc/callback", { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER,
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Missing code/state");
  });

  it("GET /callback returns 400 for invalid state", async () => {
    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(),
      exchangeCodeForTokens: vi.fn(),
      fetchGoogleUserInfo: vi.fn(),
    }));

    const { GoogleHandler } = await import("../google.handler");

    const badState = (globalThis as any).btoa(JSON.stringify({ clientId: "" }));
    const url = `https://svc/callback?code=c&state=${encodeURIComponent(badState)}`;

    const OAUTH_PROVIDER = {
      parseAuthRequest: vi.fn(),
      completeAuthorization: vi.fn(),
    };

    const req = new Request(url, { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER,
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid state");
  });

  it("GET /callback completes auth and redirects back to MCP", async () => {
    const exchangeCodeForTokens = vi.fn(async () => ({
      access_token: "at",
      expires_in: 3600,
      token_type: "Bearer",
    }));
    const fetchGoogleUserInfo = vi.fn(async () => ({
      sub: "user-1",
      email: "a@b.com",
      name: "Alice",
    }));

    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(),
      exchangeCodeForTokens,
      fetchGoogleUserInfo,
    }));

    const { GoogleHandler } = await import("../google.handler");

    const oauthReqInfo = { clientId: "client-1", scope: "s1" };
    const goodState = (globalThis as any).btoa(JSON.stringify(oauthReqInfo));
    const url = `https://svc/callback?code=CODE&state=${encodeURIComponent(goodState)}`;

    const completeAuthorization = vi.fn(async () => ({
      redirectTo: "https://mcp.example/complete?token=1",
    }));

    const OAUTH_PROVIDER = {
      parseAuthRequest: vi.fn(),
      completeAuthorization,
    };

    const req = new Request(url, { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER,
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(exchangeCodeForTokens).toHaveBeenCalledWith({
      client_id: "cid",
      client_secret: "sec",
      code: "CODE",
      redirect_uri: "https://svc/callback",
    });
    expect(fetchGoogleUserInfo).toHaveBeenCalledWith("at");

    expect(completeAuthorization).toHaveBeenCalledTimes(1);
    const callArg = completeAuthorization.mock.calls[0]?.[0] as any;
    expect(callArg.userId).toBe("user-1");
    expect(callArg.props).toEqual({ sub: "user-1", email: "a@b.com", name: "Alice" });
    expect(callArg.metadata).toEqual({ label: "a@b.com" });

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://mcp.example/complete?token=1",
    );
  });

  it("GET /callback uses sub as label when email missing", async () => {
    const exchangeCodeForTokens = vi.fn(async () => ({
      access_token: "at",
      expires_in: 3600,
      token_type: "Bearer",
    }));
    const fetchGoogleUserInfo = vi.fn(async () => ({
      sub: "user-2",
      name: "NoEmail",
    }));

    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(),
      exchangeCodeForTokens,
      fetchGoogleUserInfo,
    }));

    const { GoogleHandler } = await import("../google.handler");

    const oauthReqInfo = { clientId: "client-1", scope: "s1" };
    const goodState = (globalThis as any).btoa(JSON.stringify(oauthReqInfo));
    const url = `https://svc/callback?code=CODE&state=${encodeURIComponent(goodState)}`;

    const completeAuthorization = vi.fn(async () => ({
      redirectTo: "https://mcp.example/complete?token=2",
    }));

    const res = await (GoogleHandler as any).fetch(
      new Request(url, { method: "GET" }),
      {
        OAUTH_PROVIDER: {
          parseAuthRequest: vi.fn(),
          completeAuthorization,
        },
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(302);
    const callArg = completeAuthorization.mock.calls[0]?.[0] as any;
    expect(callArg.metadata).toEqual({ label: "user-2" });
  });

  it("unknown routes return 404", async () => {
    vi.doMock("../google-oauth.utils", () => ({
      getGoogleAuthorizeUrl: vi.fn(),
      exchangeCodeForTokens: vi.fn(),
      fetchGoogleUserInfo: vi.fn(),
    }));

    const { GoogleHandler } = await import("../google.handler");
    const req = new Request("https://svc/nope", { method: "GET" });
    const res = await (GoogleHandler as any).fetch(
      req,
      {
        OAUTH_PROVIDER: {
          parseAuthRequest: vi.fn(),
          completeAuthorization: vi.fn(),
        },
        GOOGLE_CLIENT_ID: "cid",
        GOOGLE_CLIENT_SECRET: "sec",
      } as any,
      {} as any,
    );

    expect(res.status).toBe(404);
  });
});

