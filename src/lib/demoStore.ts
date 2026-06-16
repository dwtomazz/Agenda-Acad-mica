const PREFIX = "demo_store_";

function read<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PREFIX + key) || "[]"); } catch { return []; }
}
function write<T>(key: string, items: T[]) {
  localStorage.setItem(PREFIX + key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("demo-store-change", { detail: key }));
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

export const demoStore = {
  list<T = any>(key: string): T[] { return read<T>(key); },
  create<T extends Record<string, any>>(key: string, item: T): T & { id: string; created_at: string } {
    const row = { id: uid(), created_at: new Date().toISOString(), ...item } as any;
    write(key, [...read(key), row]);
    return row;
  },
  update<T extends Record<string, any>>(key: string, id: string, patch: Partial<T>) {
    write(key, read<any>(key).map((r) => (r.id === id ? { ...r, ...patch } : r)));
  },
  remove(key: string, id: string) {
    write(key, read<any>(key).filter((r) => r.id !== id));
  },
};

export const KEYS = {
  disciplinas: "disciplinas",
  turmas: "turmas",
  avisos: "avisos",
} as const;