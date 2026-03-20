import { webcrypto } from "node:crypto";

import { beforeAll, vi } from "vitest";

/**
 * Static `import { env } from "cloudflare:workers"` must be mocked at top level
 * so Node Vitest (e.g. `vitest.coverage.config.ts`) can resolve the module.
 * `@cloudflare/vitest-pool-workers` also runs this file; the mock stays compatible.
 */
vi.mock("cloudflare:workers", async () => {
  const m = await import("../stubs/cloudflare-workers");
  return m;
});

beforeAll(() => {
  // vi.spyOn(console, "debug").mockImplementation(() => {});
});

/**
 * Vitest (node) doesn't always provide these globals in all runtimes.
 * OAuth helpers are written against the Workers/Web Platform APIs.
 */
export function installWebPlatformPolyfills() {
  const g = globalThis as typeof globalThis & { crypto?: Crypto };
  if (!g.crypto) {
    g.crypto = webcrypto as unknown as Crypto;
  }

  if (!globalThis.atob) {
    globalThis.atob = (input: string) =>
      Buffer.from(input, "base64").toString("binary");
  }

  if (!globalThis.btoa) {
    globalThis.btoa = (input: string) =>
      Buffer.from(input, "binary").toString("base64");
  }
}

// Run when this file is loaded via Vitest `setupFiles` (before each test file).
installWebPlatformPolyfills();
