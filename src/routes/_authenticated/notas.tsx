import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge } from "@/components/ui-bits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/notas")({ component: NotasFreq });

function NotasFreq() {
  const { user } = useAuth();
  const notas = useQuery({
    queryKey: ["minhas-notas", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("notas").select("id,descricao,valor,peso,turma_id,created_at,turmas(nome,disciplinas(nome))").eq("aluno_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const freq = useQuery({
    queryKey: ["minha-freq", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("frequencias").select("id,data,presente,turmas(nome)").eq("aluno_id", user!.id)).data ?? [],
  });

  // agrupa por turma
  const porTurma = new Map<string, { nome: string; notas: any[]; freq: any[] }>();
  notas.data?.forEach((n: any) => {
    const k = n.turma_id;
    if (!porTurma.has(k)) porTurma.set(k, { nome: n.turmas?.nome ?? "Turma", notas: [], freq: [] });
    porTurma.get(k)!.notas.push(n);
  });
  freq.data?.forEach((f: any) => {
    const turmaId = (f as any).turma_id ?? "_";
    if (!porTurma.has(turmaId)) porTurma.set(turmaId, { nome: f.turmas?.nome ?? "Turma", notas: [], freq: [] });
    porTurma.get(turmaId)!.freq.push(f);
  });

  return (
    <AppShell title="Notas e Frequência">
      {porTurma.size === 0 ? <Empty>Sem notas ou frequência registradas.</Empty> : (
        <div className="space-y-5">
          {[...porTurma.entries()].map(([k, t]) => {
            const media = t.notas.length ? (t.notas.reduce((a, n) => a + Number(n.valor) * Number(n.peso), 0) / t.notas.reduce((a, n) => a + Number(n.peso), 0)) : null;
            const presentes = t.freq.filter((x) => x.presente).length;
            const taxa = t.freq.length ? Math.round((presentes / t.freq.length) * 100) : null;
            const sit = media == null ? "—" : media >= 6 ? "Aprovado" : "Recuperação";
            return (
              <Card key={k}>
                <p className="text-base font-bold">{t.nome}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-2xl font-bold text-primary">{media?.toFixed(1) ?? "—"}</p><p className="text-[10px] uppercase text-muted-foreground">Média</p></div>
                  <div><p className="text-2xl font-bold text-primary">{taxa ?? "—"}{taxa != null ? "%" : ""}</p><p className="text-[10px] uppercase text-muted-foreground">Frequência</p></div>
                  <div><Badge tone={media == null ? "default" : media >= 6 ? "ok" : "danger"}>{sit}</Badge></div>
                </div>
                {t.notas.length > 0 && (
                  <div className="mt-3">
                    <SectionTitle>Notas</SectionTitle>
                    <div className="space-y-1">
                      {t.notas.map((n) => (
                        <div key={n.id} className="flex items-center justify-between text-sm">
                          <span>{n.descricao}</span>
                          <span className="font-semibold">{Number(n.valor).toFixed(1)} <span className="text-xs text-muted-foreground">(peso {n.peso})</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
