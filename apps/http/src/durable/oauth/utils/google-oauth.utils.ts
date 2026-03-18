

/**
 * Get the Google authorize URL
 * @param opts - The options for the Google authorize URL
 * @returns 
 */
export function getGoogleAuthorizeUrl(opts: {
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", opts.client_id);
  url.searchParams.set("redirect_uri", opts.redirect_uri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", opts.scope);
  url.searchParams.set("state", opts.state);

  // Recommended for OIDC sign-in UX
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

/**
 * Exchange the code for tokens
 * @param opts - The options for the code exchange
 * @returns 
 */
export async function exchangeCodeForTokens(opts: {
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  refresh_token?: string;
  id_token?: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: opts.client_id,
      client_secret: opts.client_secret,
      code: opts.code,
      grant_type: "authorization_code",
      redirect_uri: opts.redirect_uri
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

/**
 * Fetch the user info from Google
 * @param accessToken - The access token to fetch the user info
 * @returns 
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}> {
  // OIDC userinfo
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google userinfo failed: ${res.status} ${text}`);
  }

  return res.json();
}