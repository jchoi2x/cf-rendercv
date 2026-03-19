import { describe, it, expect, vi, beforeEach } from "vitest";

describe("google-oauth.utils", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getGoogleAuthorizeUrl builds the expected URL", async () => {
    const { getGoogleAuthorizeUrl } = await import("../google-oauth.utils");
    const url = getGoogleAuthorizeUrl({
      client_id: "cid",
      redirect_uri: "https://example.com/callback",
      scope: "openid email",
      state: "abc",
    });

    const u = new URL(url);
    expect(u.origin).toBe("https://accounts.google.com");
    expect(u.pathname).toBe("/o/oauth2/v2/auth");
    expect(u.searchParams.get("client_id")).toBe("cid");
    expect(u.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("scope")).toBe("openid email");
    expect(u.searchParams.get("state")).toBe("abc");
    expect(u.searchParams.get("access_type")).toBe("offline");
    expect(u.searchParams.get("prompt")).toBe("consent");
  });

  it("exchangeCodeForTokens returns JSON on success", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          access_token: "at",
          expires_in: 3600,
          token_type: "Bearer",
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { exchangeCodeForTokens } = await import("../google-oauth.utils");
    const res = await exchangeCodeForTokens({
      client_id: "cid",
      client_secret: "secret",
      code: "code",
      redirect_uri: "https://example.com/callback",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["content-type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    expect(String(init.body)).toContain("client_id=cid");
    expect(res.access_token).toBe("at");
  });

  it("exchangeCodeForTokens throws a helpful error when Google responds non-2xx", async () => {
    const fetchMock = vi.fn(async () => new Response("nope", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { exchangeCodeForTokens } = await import("../google-oauth.utils");
    await expect(
      exchangeCodeForTokens({
        client_id: "cid",
        client_secret: "secret",
        code: "code",
        redirect_uri: "https://example.com/callback",
      }),
    ).rejects.toThrow("Google token exchange failed: 400 nope");
  });

  it("fetchGoogleUserInfo returns JSON on success", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe("https://openidconnect.googleapis.com/v1/userinfo");
      expect((init?.headers as Record<string, string>)?.authorization).toBe(
        "Bearer at",
      );
      return new Response(JSON.stringify({ sub: "u1", email: "a@b.com" }), {
        status: 200,
      });
    });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { fetchGoogleUserInfo } = await import("../google-oauth.utils");
    const profile = await fetchGoogleUserInfo("at");
    expect(profile).toEqual({ sub: "u1", email: "a@b.com" });
  });

  it("fetchGoogleUserInfo throws a helpful error when Google responds non-2xx", async () => {
    const fetchMock = vi.fn(async () => new Response("bad", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const { fetchGoogleUserInfo } = await import("../google-oauth.utils");
    await expect(fetchGoogleUserInfo("at")).rejects.toThrow(
      "Google userinfo failed: 401 bad",
    );
  });
});

