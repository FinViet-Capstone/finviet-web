// Mock "database" state must survive Next.js Fast Refresh re-evaluating a mock/<domain>.ts
// module while its file (or a file it imports) is being edited — a plain module-level `let`
// would silently reset on every unrelated hot reload. Attaching to globalThis survives that,
// since globalThis itself isn't part of the invalidated module graph.
const registry = globalThis as typeof globalThis & {
  __finvietMockStores?: Map<string, unknown>;
};

export function createDevStore<T>(key: string, seed: () => T) {
  if (!registry.__finvietMockStores) {
    registry.__finvietMockStores = new Map();
  }
  const stores = registry.__finvietMockStores;
  if (!stores.has(key)) {
    stores.set(key, seed());
  }
  return {
    get: () => stores.get(key) as T,
    set: (next: T) => stores.set(key, next),
  };
}
