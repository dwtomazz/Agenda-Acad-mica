import { useEffect, useState } from "react";

export type AppRole = "aluno" | "professor" | "administrador";

const KEY = "demo_auth";

export type DemoSession = { role: AppRole; name: string } | null;

export function readDemoSession(): DemoSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role) return null;
    return { role: parsed.role as AppRole, name: parsed.name ?? "Usuário Demo" };
  } catch {
    return null;
  }
}

export function writeDemoSession(s: { role: AppRole; name?: string }) {
  window.localStorage.setItem(KEY, JSON.stringify({ role: s.role, name: s.name ?? "Usuário Demo" }));
  window.dispatchEvent(new Event("demo-auth-change"));
}

export function clearDemoSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("demo-auth-change"));
}

function useDemoSession() {
  const [s, setS] = useState<DemoSession>(() => readDemoSession());
  useEffect(() => {
    const sync = () => setS(readDemoSession());
    window.addEventListener("storage", sync);
    window.addEventListener("demo-auth-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("demo-auth-change", sync);
    };
  }, []);
  return s;
}

export function useAuth() {
  const s = useDemoSession();
  const user = s
    ? { id: `demo-${s.role}`, email: `${s.role}@demo.local`, full_name: s.name }
    : null;
  return { session: s, user, loading: false };
}

export function useUserRole() {
  const s = useDemoSession();
  return { role: s?.role ?? null, loading: false };
}

export function signOutDemo() {
  clearDemoSession();
}