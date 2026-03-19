import { createMemoryKV } from "./memory-kv.mock";

type Auth0HandlerTestBindingsInput = {
  COOKIE_ENCRYPTION_KEY?: string;
  OAUTH_KV?: any;
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
  AUTH0_DOMAIN?: string;
  AUTH0_AUDIENCE?: string;
  AUTH0_SCOPE?: string | undefined;
  OAUTH_PROVIDER?: any;
} & Record<string, any>;

/**
 * Default Hono `env` bindings for `auth0.handler` tests.
 * Pass overrides; omit `OAUTH_KV` to get a fresh in-memory KV per call.
 */
export function auth0HandlerTestBindings(
  overrides: Auth0HandlerTestBindingsInput = {},
): any {
  const {
    OAUTH_KV = createMemoryKV(),
    COOKIE_ENCRYPTION_KEY = "secret",
    AUTH0_CLIENT_ID = "auth0-client",
    AUTH0_CLIENT_SECRET = "auth0-secret",
    AUTH0_DOMAIN = "example.auth0.com",
    AUTH0_AUDIENCE = "aud",
    AUTH0_SCOPE = "",
    OAUTH_PROVIDER = {},
    ...extra
  } = overrides;

  return {
    COOKIE_ENCRYPTION_KEY,
    OAUTH_KV,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_DOMAIN,
    AUTH0_AUDIENCE,
    AUTH0_SCOPE,
    OAUTH_PROVIDER,
    ...extra,
  };
}

/** Minimal bindings for `/callback` tests that only need KV + OAuth provider. */
export function auth0CallbackRouteTestBindings(overrides: Record<string, any> = {}): any {
  const {
    OAUTH_KV = createMemoryKV(),
    OAUTH_PROVIDER = {},
    ...extra
  } = overrides;
  return { OAUTH_KV, OAUTH_PROVIDER, ...extra };
}
