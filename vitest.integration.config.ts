import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Worker integration tests: run in `workerd` via `@cloudflare/vitest-pool-workers`
 * with the same `wrangler.jsonc` as `apps/http`.
 *
 * @see https://developers.cloudflare.com/workers/testing/vitest-integration/
 */
export default defineConfig({
  plugins: [
    cloudflareTest({
      miniflare: {
        compatibilityFlags: ["nodejs_compat", "enable_nodejs_tty_module", "enable_nodejs_fs_module", "enable_nodejs_http_modules", "enable_nodejs_perf_hooks_module", "enable_nodejs_v8_module", "enable_nodejs_process_v2"],
      },
      wrangler: {
        configPath: path.join(root, 'apps/http/wrangler.jsonc'),
      },
    }),
  ],
  resolve: {
    // Match apps/http so oauth provider resolves the same way in the test bundle.
    conditions: ['workerd', 'browser', 'import'],
  },
  ssr: {
    noExternal: ['@cloudflare/workers-oauth-provider'],
  },
  test: {
    globals: true,
    include: ['integration/**/*.integration.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Pool Workers runs one file at a time by default for isolation; keep timeouts generous.
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
