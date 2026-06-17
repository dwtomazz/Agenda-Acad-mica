import { useEffect, useState } from "react";
import { demoStore, KEYS, type Usuario, type Turma } from "@/lib/demoStore";
import { useAuth } from "./useAuth";

export function useDemoList<T = any>(key: string): T[] {
  const [list, setList] = useState<T[]>(() => demoStore.list<T>(key));
  useEffect(() => {
    const sync = () => setList(demoStore.list<T>(key));
    window.addEventListener("demo-store-change", sync);
    window.addEventListener("storage", sync);
    sync();
    return () => {
      window.removeEventListener("demo-store-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  return list;
}

export function useDemoUser(): Usuario | null {
  const { user } = useAuth();
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  if (!user) return null;
  return usuarios.find((u) => u.id === user.id) ?? null;
}

export function useMinhasTurmas(): Turma[] {
  const me = useDemoUser();
  const turmas = useDemoList<Turma>(KEYS.turmas);
  if (!me) return [];
  if (me.perfil === "administrador") return turmas;
  if (me.perfil === "professor") return turmas.filter((t) => t.professores.includes(me.id));
  return turmas.filter((t) => t.alunos.includes(me.id));
}