import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { createMemoryKV } from "../__mocks__/memory-kv.mock";
import {
  auth0CallbackRouteTestBindings,
  auth0HandlerTestBindings,
} from "../__mocks__/auth0.handler.mock";
import { addApprovedClient, bindStateToSession, createOAuthState } from "../workers-oauth-utils";

const oauthMock = {
  discoveryRequest: vi.fn(),
  processDiscoveryResponse: vi.fn(),
  ClientSecretPost: vi.fn(),
  generateRandomCodeVerifier: vi.fn(),
  generateRandomNonce: vi.fn(),
  calculatePKCECodeChallenge: vi.fn(),
  validateAuthResponse: vi.fn(),
  authorizationCodeGrantRequest: vi.fn(),
  processAuthorizationCodeResponse: vi.fn(),
  getValidatedIdTokenClaims: vi.fn(),
  refreshTokenGrantRequest: vi.fn(),
  processRefreshTokenResponse: vi.fn(),
};

vi.mock("oauth4webapi", () => oauthMock);

function makeApp(handlers: {
  authorize: any;
  confirmConsent: any;
  callback: any;
}) {
  const app = new Hono();
  app.get("/authorize", (c) => handlers.authorize(c as any));
  app.post("/authorize", (c) => handlers.confirmConsent(c as any));
  app.get("/auth/callback/auth0", (c) => handlers.callback(c as any));
  app.get("/callback", (c) => handlers.callback(c as any));
  return app;
}

describe("auth0.handler", () => {
  beforeEach(() => {
    for (const key of Object.keys(oauthMock) as (keyof typeof oauthMock)[]) {
      oauthMock[key].mockReset();
    }
  });

  it("getOidcConfig performs discovery and returns client auth", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ issuer: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");

    const { getOidcConfig } = await import("../auth0.handler");

    const out = await getOidcConfig({
      issuer: "https://issuer.example.com/",
      client_id: "cid",
      client_secret: "csec",
    });

    expect(oauthMock.discoveryRequest).toHaveBeenCalledTimes(1);
    expect(oauthMock.processDiscoveryResponse).toHaveBeenCalledTimes(1);
    expect(oauthMock.ClientSecretPost).toHaveBeenCalledWith("csec");
    expect(out.client).toEqual({ client_id: "cid" });
    expect(out.clientAuth).toBe("client-auth");
    expect(out.as).toEqual({ issuer: "x" });
  });

  it("authorize returns 400 when clientId missing", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings({
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({})),
      },
    });

    const res = await app.request("https://e.com/authorize", {}, env);
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid request");
  });

  it("authorize returns 400 when client lookup fails", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings({
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({ clientId: "c1" })),
        lookupClient: vi.fn(async () => null),
      },
    });

    const res = await app.request("https://e.com/authorize", {}, env);
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid client");
  });

  it("authorize renders consent dialog when client not approved", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings({
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({ clientId: "c1" })),
        lookupClient: vi.fn(async () => ({
          clientId: "c1",
          clientName: "Client 1",
          redirectUris: ["https://ok.example.com"],
        })),
      },
    });

    const res = await app.request("https://e.com/authorize", {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toContain("__Host-CSRF_TOKEN=");
    const html = await res.text();
    expect(html).toContain('name="csrf_token"');
    expect(html).toContain('method="post" action="/authorize"');
  });

  it("authorize redirects to Auth0 when client is approved and sets session cookie", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({
      authorization_endpoint: "https://auth.example.com/authorize",
    });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");

    oauthMock.generateRandomCodeVerifier.mockReturnValue("verifier");
    oauthMock.generateRandomNonce.mockReturnValue("nonce");
    oauthMock.calculatePKCECodeChallenge.mockResolvedValue("challenge");

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const env = auth0HandlerTestBindings({
      OAUTH_KV: kv,
      AUTH0_SCOPE: undefined,
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({ clientId: "c1", scope: "x" })),
        lookupClient: vi.fn(async () => ({ clientId: "c1" })),
      },
    });

    // Mark client approved by issuing the cookie first.
    const approvedCookie = (await addApprovedClient(new Request("https://e.com/authorize"), "c1", "secret"))
      .split(";")[0]!;

    const res = await app.request(
      "https://e.com/authorize",
      { headers: { Cookie: approvedCookie } },
      env,
    );

    expect(res.status).toBe(302);
    const loc = res.headers.get("Location")!;
    expect(loc).toContain("https://auth.example.com/authorize");
    expect(loc).toContain("scope=");
    expect(loc).toContain("openid");
    expect(loc).toContain("profile");
    expect(loc).toContain("email");
    expect(res.headers.get("Set-Cookie")).toContain("__Host-CONSENTED_STATE=");

    // State should be stored in KV under some generated UUID (we don't assert exact value).
    expect([...kv._store.keys()].some((k) => String(k).startsWith("oauth:state:"))).toBe(true);
  });

  it("authorize includes normalized required scopes when AUTH0_SCOPE is non-empty", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({
      authorization_endpoint: "https://auth.example.com/authorize",
    });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");
    oauthMock.generateRandomCodeVerifier.mockReturnValue("verifier");
    oauthMock.generateRandomNonce.mockReturnValue("nonce");
    oauthMock.calculatePKCECodeChallenge.mockResolvedValue("challenge");

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings({
      AUTH0_SCOPE: "custom-scope openid",
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({ clientId: "c1", scope: "x" })),
        lookupClient: vi.fn(async () => ({ clientId: "c1" })),
      },
    });

    const approvedCookie = (await addApprovedClient(new Request("https://e.com/authorize"), "c1", "secret"))
      .split(";")[0]!;

    const res = await app.request(
      "https://e.com/authorize",
      { headers: { Cookie: approvedCookie } },
      env,
    );
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location")!;
    expect(loc).toContain("scope=");
    expect(loc).toContain("custom-scope");
    expect(loc).toContain("openid");
    expect(loc).toContain("profile");
    expect(loc).toContain("email");
  });

  it("authorize returns 500 when discovery has no authorization endpoint", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({});
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");
    oauthMock.generateRandomCodeVerifier.mockReturnValue("verifier");
    oauthMock.generateRandomNonce.mockReturnValue("nonce");
    oauthMock.calculatePKCECodeChallenge.mockResolvedValue("challenge");

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings({
      OAUTH_PROVIDER: {
        parseAuthRequest: vi.fn(async () => ({ clientId: "c1" })),
        lookupClient: vi.fn(async () => ({ clientId: "c1" })),
      },
    });

    const approvedCookie = (await addApprovedClient(new Request("https://e.com/authorize"), "c1", "secret"))
      .split(";")[0]!;

    const res = await app.request("https://e.com/authorize", { headers: { Cookie: approvedCookie } }, env);
    expect(res.status).toBe(500);
    await expect(res.text()).resolves.toBe("Invalid authorization endpoint");
  });

  it("confirmConsent returns 400 on missing state", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const fd = new FormData();
    fd.set("csrf_token", "t1");

    const env = auth0HandlerTestBindings();

    const res = await app.request(
      "https://e.com/authorize",
      { method: "POST", body: fd, headers: { Cookie: "__Host-CSRF_TOKEN=t1" } },
      env,
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Missing state in form data");
  });

  it("confirmConsent returns 400 on invalid state JSON", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const fd = new FormData();
    fd.set("csrf_token", "t1");
    fd.set("state", "not-base64-json");

    const env = auth0HandlerTestBindings();

    const res = await app.request(
      "https://e.com/authorize",
      { method: "POST", body: fd, headers: { Cookie: "__Host-CSRF_TOKEN=t1" } },
      env,
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid state data");
  });

  it("confirmConsent returns 400 on structurally invalid decoded state", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0HandlerTestBindings();

    const fd = new FormData();
    fd.set("csrf_token", "t1");
    fd.set("state", btoa(JSON.stringify({ oauthReqInfo: {}, auth0Data: null })));

    const res = await app.request(
      "https://e.com/authorize",
      { method: "POST", body: fd, headers: { Cookie: "__Host-CSRF_TOKEN=t1" } },
      env,
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid request");
  });

  it("confirmConsent redirects to Auth0 and sets approved + session cookies", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({
      authorization_endpoint: "https://auth.example.com/authorize",
    });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const env = auth0HandlerTestBindings({ OAUTH_KV: kv });

    const oauthReqInfo = { clientId: "c1", scope: "s" };
    const auth0Data = {
      codeChallenge: "cc",
      codeVerifier: "cv",
      nonce: "n",
      consentToken: "",
      transactionState: "",
    };

    const fd = new FormData();
    fd.set("csrf_token", "t1");
    fd.set("state", btoa(JSON.stringify({ oauthReqInfo, auth0Data })));

    const res = await app.request(
      "https://e.com/authorize",
      { method: "POST", body: fd, headers: { Cookie: "__Host-CSRF_TOKEN=t1" } },
      env,
    );

    expect(res.status).toBe(302);
    const loc = res.headers.get("Location")!;
    expect(loc).toContain("https://auth.example.com/authorize");
    expect(res.headers.get("Set-Cookie")).toBeTruthy();

    const setCookieCombined = res.headers.get("Set-Cookie")!;
    expect(setCookieCombined).toContain("__Host-APPROVED_CLIENTS=");
    expect(setCookieCombined).toContain("__Host-CONSENTED_STATE=");

    expect([...kv._store.keys()].some((k) => String(k).startsWith("oauth:state:"))).toBe(true);
  });

  it("confirmConsent returns OAuthError response when CSRF invalid", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const fd = new FormData();
    fd.set("csrf_token", "t1");
    fd.set("state", btoa(JSON.stringify({ oauthReqInfo: { clientId: "c1" }, auth0Data: { codeVerifier: "x", codeChallenge: "y", nonce: "z", transactionState: "", consentToken: "" } })));

    const env = auth0HandlerTestBindings();

    const res = await app.request("https://e.com/authorize", { method: "POST", body: fd }, env);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "invalid_request" });
  });

  it("confirmConsent returns 500 for unexpected errors", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const bad = new FormData();
    bad.set("csrf_token", "t1");
    bad.set("state", btoa(JSON.stringify({ oauthReqInfo: { clientId: "c1" }, auth0Data: { codeVerifier: "x", codeChallenge: "y", nonce: "z", transactionState: "", consentToken: "" } })));

    const env = auth0HandlerTestBindings({
      COOKIE_ENCRYPTION_KEY: "", // will cause internal error when signing cookie
    });

    const res = await app.request(
      "https://e.com/authorize",
      { method: "POST", body: bad, headers: { Cookie: "__Host-CSRF_TOKEN=t1" } },
      env,
    );
    expect(res.status).toBe(500);
    expect(await res.text()).toContain("Internal server error:");
  });

  it("callback returns OAuthError response when state validation fails", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0CallbackRouteTestBindings();

    const res = await app.request("https://e.com/auth/callback/auth0?state=missing", {}, env);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "invalid_request" });
  });

  it("callback returns 500 when state validation throws non-OAuth error", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const env = auth0CallbackRouteTestBindings({
      OAUTH_KV: {
        get: vi.fn(async () => {
          throw new Error("boom");
        }),
        delete: vi.fn(async () => {}),
      },
    });

    const res = await app.request("https://e.com/auth/callback/auth0?state=abc", {}, env);
    expect(res.status).toBe(500);
    await expect(res.text()).resolves.toBe("Internal server error");
  });

  it("callback returns 400 if stored data missing clientId/auth0Data", async () => {
    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const { stateToken } = await createOAuthState({ scope: "x" } as any, kv);
    const { setCookie } = await bindStateToSession(stateToken);

    const env = auth0CallbackRouteTestBindings({ OAUTH_KV: kv });

    const res = await app.request(
      `https://e.com/auth/callback/auth0?state=${stateToken}`,
      { headers: { Cookie: setCookie.split(";")[0]! } },
      env,
    );
    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid OAuth request data");
  });

  it("callback completes authorization and clears session cookie", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ issuer: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");

    oauthMock.validateAuthResponse.mockReturnValue("params");
    oauthMock.authorizationCodeGrantRequest.mockResolvedValue("code-resp");
    oauthMock.processAuthorizationCodeResponse.mockResolvedValue({
      access_token: "at",
      expires_in: 42,
      id_token: "idt",
      refresh_token: "rt",
    });
    oauthMock.getValidatedIdTokenClaims.mockReturnValue({
      sub: "user-1",
      name: "A",
      email: "a@b.c",
    });

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const stored = {
      clientId: "client-1",
      scope: "s",
      auth0Data: {
        codeVerifier: "ver",
        codeChallenge: "ch",
        nonce: "nonce",
        consentToken: "",
        transactionState: "",
      },
    };
    const { stateToken } = await createOAuthState(stored as any, kv);
    const { setCookie } = await bindStateToSession(stateToken);

    const env = auth0HandlerTestBindings({
      OAUTH_KV: kv,
      OAUTH_PROVIDER: {
        completeAuthorization: vi.fn(async () => ({ redirectTo: "https://mcp.example.com/done" })),
      },
    });

    const res = await app.request(
      `https://e.com/auth/callback/auth0?state=${stateToken}&code=abc`,
      { headers: { Cookie: setCookie.split(";")[0]! } },
      env,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("https://mcp.example.com/done");
    expect(res.headers.get("Set-Cookie")).toContain("__Host-CONSENTED_STATE=");
    expect(res.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(env.OAUTH_PROVIDER.completeAuthorization).toHaveBeenCalledTimes(1);
  });

  it("callback label falls back to email then sub", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ issuer: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");
    oauthMock.validateAuthResponse.mockReturnValue("params");
    oauthMock.authorizationCodeGrantRequest.mockResolvedValue("code-resp");
    oauthMock.processAuthorizationCodeResponse.mockResolvedValue({
      access_token: "at",
      expires_in: 42,
      id_token: "idt",
      refresh_token: "rt",
    });

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const stored = {
      clientId: "client-1",
      scope: "s",
      auth0Data: {
        codeVerifier: "ver",
        codeChallenge: "ch",
        nonce: "nonce",
        consentToken: "",
        transactionState: "",
      },
    };
    const { stateToken } = await createOAuthState(stored as any, kv);
    const { setCookie } = await bindStateToSession(stateToken);

    const completeAuthorization = vi.fn(async (opts: any) => {
      expect(opts.metadata.label).toBe("a@b.c");
      return { redirectTo: "https://mcp.example.com/done" };
    });

    oauthMock.getValidatedIdTokenClaims.mockReturnValue({
      sub: "user-1",
      email: "a@b.c",
    });

    const env = auth0HandlerTestBindings({
      OAUTH_KV: kv,
      OAUTH_PROVIDER: { completeAuthorization },
    });

    const res = await app.request(
      `https://e.com/auth/callback/auth0?state=${stateToken}&code=abc`,
      { headers: { Cookie: setCookie.split(";")[0]! } },
      env,
    );
    expect(res.status).toBe(302);

    const kv2 = createMemoryKV();
    const { stateToken: st2 } = await createOAuthState(stored as any, kv2);
    const { setCookie: sc2 } = await bindStateToSession(st2);
    oauthMock.getValidatedIdTokenClaims.mockReturnValue({
      sub: "user-2",
    });
    const completeAuthorization2 = vi.fn(async (opts: any) => {
      expect(opts.metadata.label).toBe("user-2");
      return { redirectTo: "https://mcp.example.com/done2" };
    });
    const env2 = auth0HandlerTestBindings({
      OAUTH_KV: kv2,
      OAUTH_PROVIDER: { completeAuthorization: completeAuthorization2 },
    });
    const res2 = await app.request(
      `https://e.com/auth/callback/auth0?state=${st2}&code=abc`,
      { headers: { Cookie: sc2.split(";")[0]! } },
      env2,
    );
    expect(res2.status).toBe(302);
  });

  it("callback returns 400 when Auth0 id_token claims are invalid", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ issuer: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");
    oauthMock.validateAuthResponse.mockReturnValue("params");
    oauthMock.authorizationCodeGrantRequest.mockResolvedValue("code-resp");
    oauthMock.processAuthorizationCodeResponse.mockResolvedValue({
      access_token: "at",
      expires_in: 42,
      id_token: "idt",
      refresh_token: "rt",
    });
    oauthMock.getValidatedIdTokenClaims.mockReturnValue(null);

    const { authorize, confirmConsent, callback } = await import("../auth0.handler");
    const app = makeApp({ authorize, confirmConsent, callback });

    const kv = createMemoryKV();
    const stored = {
      clientId: "client-1",
      scope: "s",
      auth0Data: {
        codeVerifier: "ver",
        codeChallenge: "ch",
        nonce: "nonce",
        consentToken: "",
        transactionState: "",
      },
    };
    const { stateToken } = await createOAuthState(stored as any, kv);
    const { setCookie } = await bindStateToSession(stateToken);

    const env = auth0HandlerTestBindings({
      OAUTH_KV: kv,
      OAUTH_PROVIDER: { completeAuthorization: vi.fn() },
    });

    const res = await app.request(
      `https://e.com/auth/callback/auth0?state=${stateToken}&code=abc`,
      { headers: { Cookie: setCookie.split(";")[0]! } },
      env,
    );

    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Received invalid id_token from Auth0");
  });

  it("tokenExchangeCallback returns TTL passthrough for authorization_code", async () => {
    const { tokenExchangeCallback } = await import("../auth0.handler");
    const out = await tokenExchangeCallback({
      grantType: "authorization_code",
      props: { tokenSet: { accessTokenTTL: 99 } },
    } as any);
    expect(out).toEqual({ accessTokenTTL: 99, newProps: { tokenSet: { accessTokenTTL: 99 } } });
  });

  it("tokenExchangeCallback refresh_token branch throws without refresh token", async () => {
    const { tokenExchangeCallback } = await import("../auth0.handler");
    await expect(
      tokenExchangeCallback({ grantType: "refresh_token", props: { tokenSet: {} } } as any),
    ).rejects.toThrow("No Auth0 refresh token found");
  });

  it("tokenExchangeCallback refresh_token branch exchanges and updates props", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ token_endpoint: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");

    oauthMock.refreshTokenGrantRequest.mockResolvedValue("refresh-resp");
    oauthMock.processRefreshTokenResponse.mockResolvedValue({
      access_token: "newAT",
      expires_in: 777,
      id_token: "newIDT",
      refresh_token: undefined,
    });
    oauthMock.getValidatedIdTokenClaims.mockReturnValue({ sub: "u1" });

    const { tokenExchangeCallback } = await import("../auth0.handler");

    const out = await tokenExchangeCallback({
      grantType: "refresh_token",
      props: { claims: { sub: "old" }, tokenSet: { refreshToken: "rt-old" } },
    } as any);

    expect(out).toEqual({
      accessTokenTTL: 777,
      newProps: {
        claims: { sub: "u1" },
        tokenSet: {
          accessToken: "newAT",
          accessTokenTTL: 777,
          idToken: "newIDT",
          refreshToken: "rt-old",
        },
      },
    });
  });

  it("tokenExchangeCallback refresh_token branch throws if refresh response has invalid id_token", async () => {
    oauthMock.discoveryRequest.mockResolvedValue("resp");
    oauthMock.processDiscoveryResponse.mockResolvedValue({ token_endpoint: "x" });
    oauthMock.ClientSecretPost.mockReturnValue("client-auth");
    oauthMock.refreshTokenGrantRequest.mockResolvedValue("refresh-resp");
    oauthMock.processRefreshTokenResponse.mockResolvedValue({
      access_token: "newAT",
      expires_in: 777,
      id_token: "newIDT",
      refresh_token: "rt-new",
    });
    oauthMock.getValidatedIdTokenClaims.mockReturnValue(null);

    const { tokenExchangeCallback } = await import("../auth0.handler");

    await expect(
      tokenExchangeCallback({
        grantType: "refresh_token",
        props: { claims: { sub: "old" }, tokenSet: { refreshToken: "rt-old" } },
      } as any),
    ).rejects.toThrow("Received invalid id_token from Auth0");
  });

  it("tokenExchangeCallback returns undefined for unsupported grant types", async () => {
    const { tokenExchangeCallback } = await import("../auth0.handler");
    await expect(
      tokenExchangeCallback({ grantType: "client_credentials" } as any),
    ).resolves.toBeUndefined();
  });
});

