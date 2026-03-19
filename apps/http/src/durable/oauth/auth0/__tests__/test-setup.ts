import { webcrypto } from "node:crypto";

export function installWebPlatformPolyfills() {
  // Vitest (node) doesn't always provide these globals in all runtimes.
  // Our auth helpers are written against the Workers/Web Platform APIs.
  const g = globalThis as typeof globalThis & { crypto?: typeof webcrypto };
  if (!g.crypto) {
    g.crypto = webcrypto;
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

export function createMemoryKV() {
  const store = new Map<string, { value: string; expirationTtl?: number }>();

  return {
    _store: store,
    async put(key: string, value: string, opts?: { expirationTtl?: number }) {
      store.set(key, { value, expirationTtl: opts?.expirationTtl });
    },
    async get(key: string) {
      return store.get(key)?.value ?? null;
    },
    async delete(key: string) {
      store.delete(key);
    },
  } as any;
}

