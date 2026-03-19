/**
 * Stub for `cloudflare:workers` when running Vitest in Node (e.g. coverage config).
 * Must include symbols imported by dependencies (e.g. `WorkerEntrypoint` from
 * `@cloudflare/workers-oauth-provider`), not only app `env`.
 */
export const env = {
  AUTH0_CLIENT_ID: "auth0-client",
  AUTH0_CLIENT_SECRET: "auth0-secret",
  AUTH0_DOMAIN: "example.auth0.com",
  AUTH0_AUDIENCE: "aud",
  AUTH0_SCOPE: "read:all",
  DOCKER_RENDERCV_APP: "docker-rendercv-app",
  S3_ACCESS_KEY_ID: "s3-access-key",
  S3_SECRET_ACCESS_KEY: "s3-secret",
  S3_URL: "https://example.r2.cloudflarestorage.com",
  S3_BUCKET: "bucket",
  S3_PUBLIC_URL: "https://public.example.com",
  RATE_LIMITER: {
    limit: async () => ({ success: true }),
  },
} as const;

export class WorkerEntrypoint {
  constructor(..._args: unknown[]) {}
}
