import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

/** v8 coverage uses Node inspector APIs that are not available in the Workers test isolate. */
const coverageEnabled = process.argv.some(
  (arg) => arg === '--coverage' || arg.startsWith('--coverage='),
);

export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: coverageEnabled
    ? []
    : [
        cloudflareTest({
          wrangler: {
            configPath: './wrangler.jsonc',
          },
        }),
      ],
  resolve: {
    alias: {
      'cloudflare:workers': path.join(
        root,
        '.vitest/unit/stubs/cloudflare-workers.ts',
      ),
    },
  },
  ssr: {
    noExternal: ['@cloudflare/workers-oauth-provider', '@jchoi2x/minijinja'],
  },
  test: {
    name: 'http-workers',
    globals: true,
    globalSetup: ['./.vitest/unit/global-setup.ts'],
    // Polyfills (crypto/atob/btoa) must run in the same isolate as tests.
    // `globalSetup` runs in a separate Node process and cannot patch Workers test globals.
    setupFiles: ['./.vitest/unit/setup-files/test-setup.ts'],
    include: ['src/**/__tests__/**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Run in Node (vitest.node.config.ts): fixtures + MiniJinja WASM do not resolve in workerd pool.
      'src/durable/rendercv/renderer/__tests__/renderer.spec.ts',
      'src/durable/rendercv/templater/__tests__/create-template-model.spec.ts',
      'src/durable/rendercv/templater/__tests__/process-model.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        '**/node_modules/**',
      ],
    },
  },
});
