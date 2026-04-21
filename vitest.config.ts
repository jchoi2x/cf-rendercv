import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vitest v4 projects support replaces the old `vitest.workspace.ts` approach.
    // Workers pool + separate Node config for WASM/fixture-heavy templater/renderer specs.
    projects: [
      'apps/http/vitest.config.ts',
      'apps/http/vitest.node.config.ts',
    ],
  },
});

