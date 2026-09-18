import { afterEach, vi } from "vitest";

// happy-dom 20 keeps its localStorage behind a Window.prototype accessor;
// vitest 4.1.5 populateGlobal copies own props only, so expose a working
// storage on the global to keep the whole suite runnable.
const g = globalThis as Record<string, unknown>;
if (!g.localStorage) {
  const store = new Map<string, string>();
  g.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
