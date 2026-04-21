import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Vitest v4 projects support replaces the old `vitest.workspace.ts` approach.
    // Each project directory should contain its own `vitest.config.ts`.
    projects: ['apps/http'],
  },
});

