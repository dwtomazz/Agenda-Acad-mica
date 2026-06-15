import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, Empty } from "@/components/ui-bits";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/turmas")({ component: TurmasList });

function TurmasList() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const turmas = useQuery({
    queryKey: ["turmas-list", user?.id, role],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("turmas").select("id,nome,ano,disciplinas(nome),profiles!turmas_professor_id_fkey(full_name)");
      if (role === "professor") q = q.eq("professor_id", user!.id);
      const { data } = await q.order("ano", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <AppShell title={role === "professor" ? "Minhas turmas" : "Turmas"}>
      {turmas.data?.length ? (
        <div className="space-y-2">
          {turmas.data.map((t: any) => (
            <Link key={t.id} to="/turmas/$id" params={{ id: t.id }} className="block">
              <Card className="flex items-center gap-3">
                <BookOpen size={20} className="text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.nome}</p>
                  <p className="text-xs text-muted-foreground">{t.disciplinas?.nome ?? "Sem disciplina"} · {t.ano} · prof. {t.profiles?.full_name ?? "—"}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : <Empty>Nenhuma turma.</Empty>}
    </AppShell>
  );
}
