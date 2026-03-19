import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  OAuthError,
  addApprovedClient,
  bindStateToSession,
  createOAuthState,
  generateCSRFProtection,
  isClientApproved,
  renderApprovalDialog,
  sanitizeText,
  sanitizeUrl,
  validateCSRFToken,
  validateOAuthState,
} from "../workers-oauth-utils";
import { createMemoryKV, installWebPlatformPolyfills } from "./test-setup";

beforeAll(() => {
  installWebPlatformPolyfills();
});

describe("workers-oauth-utils", () => {
  it("OAuthError.toResponse returns OAuth-compliant JSON", async () => {
    const err = new OAuthError("invalid_request", "Nope", 418);
    const res = err.toResponse();
    expect(res.status).toBe(418);
    expect(res.headers.get("Content-Type")).toContain("application/json");
    await expect(res.json()).resolves.toEqual({
      error: "invalid_request",
      error_description: "Nope",
    });
  });

  it("sanitizeText escapes HTML special chars", () => {
    expect(sanitizeText(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#039;");
  });

  it("sanitizeUrl returns empty for blank, control chars, invalid URLs, and non-http(s) schemes", () => {
    expect(sanitizeUrl("   ")).toBe("");
    expect(sanitizeUrl("https://example.com\u0007")).toBe("");
    expect(sanitizeUrl("https://example.com\u007f")).toBe("");
    expect(sanitizeUrl("not a url")).toBe("");
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html;base64,AA==")).toBe("");
  });

  it("sanitizeUrl allows http/https and preserves trimmed string", () => {
    expect(sanitizeUrl("https://example.com/a?b=c")).toBe(
      "https://example.com/a?b=c",
    );
    expect(sanitizeUrl("  http://example.com  ")).toBe("http://example.com");
  });

  it("generateCSRFProtection creates token and cookie with expected attributes", () => {
    const spy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("uuid-123");

    const { token, setCookie } = generateCSRFProtection();
    expect(token).toBe("uuid-123");
    expect(setCookie).toContain("__Host-CSRF_TOKEN=uuid-123");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Max-Age=600");

    spy.mockRestore();
  });

  it("validateCSRFToken throws on missing form token", () => {
    const fd = new FormData();
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: "__Host-CSRF_TOKEN=abc" },
    });
    expect(() => validateCSRFToken(fd, req)).toThrowError(OAuthError);
  });

  it("validateCSRFToken throws on missing cookie token", () => {
    const fd = new FormData();
    fd.set("csrf_token", "abc");
    const req = new Request("https://example.com/authorize");
    expect(() => validateCSRFToken(fd, req)).toThrowError(OAuthError);
  });

  it("validateCSRFToken throws on mismatch", () => {
    const fd = new FormData();
    fd.set("csrf_token", "abc");
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: "__Host-CSRF_TOKEN=def" },
    });
    expect(() => validateCSRFToken(fd, req)).toThrowError(OAuthError);
  });

  it("validateCSRFToken returns clear cookie on match", () => {
    const fd = new FormData();
    fd.set("csrf_token", "abc");
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: "__Host-CSRF_TOKEN=abc" },
    });
    const { clearCookie } = validateCSRFToken(fd, req);
    expect(clearCookie).toContain("__Host-CSRF_TOKEN=");
    expect(clearCookie).toContain("Max-Age=0");
  });

  it("createOAuthState stores state in KV and returns token", async () => {
    const spy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("state-1");

    const kv = createMemoryKV();
    const oauthReqInfo = { clientId: "client-1", scope: "x" } as any;

    const { stateToken } = await createOAuthState(oauthReqInfo, kv, 123);
    expect(stateToken).toBe("state-1");
    expect(kv._store.get("oauth:state:state-1")).toEqual({
      value: JSON.stringify(oauthReqInfo),
      expirationTtl: 123,
    });

    spy.mockRestore();
  });

  it("bindStateToSession hashes token and returns consent cookie", async () => {
    const { setCookie } = await bindStateToSession("state-xyz");
    expect(setCookie).toMatch(/^__Host-CONSENTED_STATE=[0-9a-f]{64};/);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Max-Age=600");
  });

  it("validateOAuthState validates kv+cookie, deletes kv state, and returns clear cookie", async () => {
    const kv = createMemoryKV();
    await kv.put("oauth:state:abc", JSON.stringify({ clientId: "c1" }));

    const { setCookie } = await bindStateToSession("abc");
    const cookie = setCookie.split(";")[0]!;

    const req = new Request("https://example.com/callback?state=abc", {
      headers: { Cookie: cookie },
    });

    const res = await validateOAuthState(req, kv);
    expect(res.oauthReqInfo).toEqual({ clientId: "c1" });
    expect(res.clearCookie).toContain("__Host-CONSENTED_STATE=");
    expect(res.clearCookie).toContain("Max-Age=0");
    expect(await kv.get("oauth:state:abc")).toBeNull();
  });

  it("validateOAuthState throws OAuthError on missing state, missing KV, missing cookie, mismatch, and invalid JSON", async () => {
    const kv = createMemoryKV();

    await expect(
      validateOAuthState(new Request("https://e.com/callback"), kv),
    ).rejects.toBeInstanceOf(OAuthError);

    await expect(
      validateOAuthState(new Request("https://e.com/callback?state=abc"), kv),
    ).rejects.toBeInstanceOf(OAuthError);

    await kv.put("oauth:state:abc", JSON.stringify({ clientId: "c1" }));
    await expect(
      validateOAuthState(new Request("https://e.com/callback?state=abc"), kv),
    ).rejects.toBeInstanceOf(OAuthError);

    const { setCookie } = await bindStateToSession("different");
    const cookie = setCookie.split(";")[0]!;
    await expect(
      validateOAuthState(
        new Request("https://e.com/callback?state=abc", {
          headers: { Cookie: cookie },
        }),
        kv,
      ),
    ).rejects.toBeInstanceOf(OAuthError);

    await kv.put("oauth:state:badjson", "{nope");
    const { setCookie: okCookie } = await bindStateToSession("badjson");
    await expect(
      validateOAuthState(
        new Request("https://e.com/callback?state=badjson", {
          headers: { Cookie: okCookie.split(";")[0]! },
        }),
        kv,
      ),
    ).rejects.toBeInstanceOf(OAuthError);
  });

  it("isClientApproved/addApprovedClient manage signed approved-client cookie", async () => {
    const secret = "super-secret";
    const baseReq = new Request("https://example.com/authorize");

    await expect(isClientApproved(baseReq, "clientA", secret)).resolves.toBe(
      false,
    );

    const setCookie = await addApprovedClient(baseReq, "clientA", secret);
    const cookiePair = setCookie.split(";")[0]!;
    const req2 = new Request("https://example.com/authorize", {
      headers: { Cookie: cookiePair },
    });

    await expect(isClientApproved(req2, "clientA", secret)).resolves.toBe(true);
    await expect(isClientApproved(req2, "clientB", secret)).resolves.toBe(false);
  });

  it("isClientApproved returns false when approved-clients cookie payload is invalid but signed", async () => {
    const secret = "super-secret";
    const payload = JSON.stringify({ not: "an-array" });

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const cookie = `__Host-APPROVED_CLIENTS=${signatureHex}.${btoa(payload)}`;
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: cookie },
    });

    await expect(isClientApproved(req, "clientA", secret)).resolves.toBe(false);
  });

  it("isClientApproved returns false when approved-clients cookie payload is malformed JSON but signed (parse catch path)", async () => {
    const secret = "super-secret";
    const payload = "{nope";

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    );
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const cookie = `__Host-APPROVED_CLIENTS=${signatureHex}.${btoa(payload)}`;
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: cookie },
    });

    await expect(isClientApproved(req, "clientA", secret)).resolves.toBe(false);
  });

  it("isClientApproved returns false when cookie signature format is invalid (verifySignature catch path)", async () => {
    const secret = "super-secret";
    const payload = JSON.stringify(["clientA"]);

    // Empty signature forces `signatureHex.match(...)` to be null -> catch -> false.
    const cookie = `__Host-APPROVED_CLIENTS=.${btoa(payload)}`;
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: cookie },
    });

    await expect(isClientApproved(req, "clientA", secret)).resolves.toBe(false);
  });

  it("renderApprovalDialog returns HTML response with CSRF + sanitized fields", async () => {
    const res = renderApprovalDialog(new Request("https://e.com/authorize"), {
      client: {
        clientName: `<b>Bad</b>`,
        clientUri: "javascript:alert(1)",
        policyUri: "https://policy.example.com",
        tosUri: "data:text/html;base64,AA==",
        contacts: ["a@example.com", "<script>x</script>"],
        redirectUris: ["https://ok.example.com", "javascript:bad"],
      } as any,
      csrfToken: "csrf-1",
      server: { name: `Srv & "x"`, description: "<i>desc</i>" },
      setCookie: "__Host-CSRF_TOKEN=csrf-1; HttpOnly",
      state: { hello: "world" },
    });

    expect(res.headers.get("Content-Type")).toContain("text/html");
    expect(res.headers.get("Set-Cookie")).toContain("__Host-CSRF_TOKEN=csrf-1");

    const html = await res.text();
    expect(html).toContain(`name="csrf_token" value="csrf-1"`);
    expect(html).toContain("Srv &amp; &quot;x&quot;");
    expect(html).toContain("&lt;b&gt;Bad&lt;/b&gt;");
    expect(html).toContain("https://policy.example.com");
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain("data:text/html");
  });

  it("renderApprovalDialog conditionally renders optional sections (logo, tos, contacts, redirect URIs)", async () => {
    const res = renderApprovalDialog(new Request("https://e.com/authorize"), {
      client: {
        clientName: "Client",
        clientUri: "https://client.example.com",
        policyUri: "",
        tosUri: "https://tos.example.com",
        contacts: [],
        redirectUris: [],
      } as any,
      csrfToken: "csrf-2",
      server: { name: "Srv", logo: "https://logo.example.com/logo.png" },
      setCookie: "__Host-CSRF_TOKEN=csrf-2; HttpOnly",
      state: { hello: "world" },
    });

    const html = await res.text();
    // Logo should render when present.
    expect(html).toContain('class="logo"');
    // TOS should render when valid.
    expect(html).toContain("Terms of Service:");
    expect(html).toContain("https://tos.example.com");
    // Contacts section should NOT render.
    expect(html).not.toContain("Contact:");
    // Redirect URIs section should NOT render.
    expect(html).not.toContain("Redirect URIs:");
    // Policy section should NOT render when empty.
    expect(html).not.toContain("Privacy Policy:");
  });

  it("renderApprovalDialog uses fallback client name when missing", async () => {
    const res = renderApprovalDialog(new Request("https://e.com/authorize"), {
      client: null,
      csrfToken: "csrf-3",
      server: { name: "Srv" },
      setCookie: "__Host-CSRF_TOKEN=csrf-3; HttpOnly",
      state: { hello: "world" },
    });

    const html = await res.text();
    expect(html).toContain("Unknown MCP Client");
  });

  it("isClientApproved returns false when approved-clients cookie has wrong format (parts.length !== 2)", async () => {
    const secret = "super-secret";
    const req = new Request("https://example.com/authorize", {
      headers: { Cookie: "__Host-APPROVED_CLIENTS=not-a-sig-or-payload" },
    });
    await expect(isClientApproved(req, "clientA", secret)).resolves.toBe(false);
  });
});

