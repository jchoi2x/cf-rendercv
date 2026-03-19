/** In-memory `KVNamespace` stub for unit tests. */
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
