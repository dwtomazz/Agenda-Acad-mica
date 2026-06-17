import { type ReactNode } from "react";
import { Empty } from "./ui-bits";
import { useDemoUser, useMinhasTurmas } from "@/hooks/useDemoData";

export function RequireTurma({ children }: { children: ReactNode }) {
  const me = useDemoUser();
  const turmas = useMinhasTurmas();
  if (!me) return null;
  if (me.perfil === "administrador") return <>{children}</>;
  if (turmas.length === 0) {
    return (
      <Empty>
        Você ainda não foi vinculado a uma turma. Entre em contato com a administração.
      </Empty>
    );
  }
  return <>{children}</>;
}