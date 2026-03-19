import type {
  AuthRequest,
  OAuthHelpers,
} from "@cloudflare/workers-oauth-provider";
import { Hono, type Context } from "hono";

import {
  getGoogleAuthorizeUrl,
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
} from "./google-oauth.utils";

type Bindings = Env & { OAUTH_PROVIDER: OAuthHelpers };

async function authorize(c: Context<{ Bindings: Bindings }>) {
  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);

  if (!oauthReqInfo.clientId) return c.text("Invalid request", 400);

  // Barebones: skip local “approval dialog” UX and jump straight to Google.
  // (If you want the approval dialog + remembered consent, add it later.)
  const state = btoa(JSON.stringify(oauthReqInfo satisfies AuthRequest));

  const redirectUri = new URL("/callback", c.req.url).href;

  const url = getGoogleAuthorizeUrl({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    // Add scopes you need (email/profile are typical)
    scope: "openid email profile",
    state,
  });

  return c.redirect(url, 302);
}

async function callback(c: Context<{ Bindings: Bindings }>) {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code || !state) return c.text("Missing code/state", 400);

  const oauthReqInfo = JSON.parse(atob(state)) as AuthRequest;
  if (!oauthReqInfo.clientId) return c.text("Invalid state", 400);

  const redirectUri = new URL("/callback", c.req.url).href;

  // 1) Exchange code for tokens at Google
  const tokens = await exchangeCodeForTokens({
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });

  // 2) Fetch user identity (use access_token; optionally validate id_token separately)
  const profile = await fetchGoogleUserInfo(tokens.access_token);

  // 3) Mint an MCP token for the MCP client and redirect back to the MCP client's callback
  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    request: oauthReqInfo,
    scope: oauthReqInfo.scope,
    // Stable user id for your own tenancy model:
    userId: profile.sub,
    // This becomes available as `this.props` / auth context in some server patterns;
    // keep it minimal and non-sensitive.
    props: {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
    },
    metadata: {
      label: profile.email ?? profile.sub,
    },
  });

  return Response.redirect(redirectTo, 302);
}

export const GoogleHandler = new Hono<{ Bindings: Bindings }>()
  // GET /authorize: called by MCP client (via browser)
  .get("/authorize", authorize)

  // GET /callback: Google redirects here
  .get("/callback", callback)
  .get("/auth/callback/google", callback)

  // Fallback
  .all("*", () => new Response("Not found", { status: 404 }));
