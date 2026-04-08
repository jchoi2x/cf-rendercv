import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["**/*.wasm"],
  ssr: {
    noExternal: ["@jchoi2x/minijinja"],
  },
  test: {
    globals: true,
    environment: "node",
    include: ["node-tests/**/*.spec.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});

