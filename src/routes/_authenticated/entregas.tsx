import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge, Field, PrimaryButton, Modal } from "@/components/ui-bits";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/entregas")({ component: EntregasPage });

function EntregasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const ativ = useQuery({
    queryKey: ["prof-ativ-list", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("atividades").select("id,titulo,turma_id,turmas(nome,professor_id)").order("prazo", { ascending: false })).data ?? [],
  });
  const entregas = useQuery({
    queryKey: ["prof-entregas"],
    enabled: !!user,
    queryFn: async () => (await supabase.from("entregas").select("id,atividade_id,aluno_id,arquivo_url,comentario_aluno,nota,comentario_prof,entregue_em,profiles(full_name)")).data ?? [],
  });

  const minhas = (ativ.data ?? []).filter((a: any) => a.turmas?.professor_id === user?.id);
  const byAtiv = new Map<string, any[]>();
  entregas.data?.forEach((e: any) => {
    if (!byAtiv.has(e.atividade_id)) byAtiv.set(e.atividade_id, []);
    byAtiv.get(e.atividade_id)!.push(e);
  });

  return (
    <AppShell title="Entregas">
      {minhas.length ? (
        <div className="space-y-4">
          {minhas.map((a: any) => {
            const list = byAtiv.get(a.id) ?? [];
            return (
              <div key={a.id}>
                <SectionTitle action={<Badge>{list.length} entregue{list.length === 1 ? "" : "s"}</Badge>}>{a.titulo} <span className="text-xs text-muted-foreground">· {a.turmas?.nome}</span></SectionTitle>
                {list.length ? list.map((e) => (
                  <Card key={e.id} className="mb-2 flex items-start gap-3">
                    <Inbox size={18} className="mt-0.5 text-primary"/>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{e.profiles?.full_name ?? "Aluno"}</p>
                      <p className="text-xs text-muted-foreground">enviado {new Date(e.entregue_em).toLocaleString("pt-BR")}</p>
                      {e.comentario_aluno && <p className="mt-1 text-xs">{e.comentario_aluno}</p>}
                      {e.arquivo_url && <a href={e.arquivo_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Abrir arquivo</a>}
                      {e.nota != null && <p className="mt-1 text-sm">Nota: <b>{Number(e.nota).toFixed(1)}</b></p>}
                    </div>
                    <button onClick={() => setEditing(e)} className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-secondary">Corrigir</button>
                  </Card>
                )) : <Empty>Sem entregas para esta atividade.</Empty>}
              </div>
            );
          })}
        </div>
      ) : <Empty>Você ainda não tem atividades em suas turmas.</Empty>}

      {editing && <CorrigirModal entrega={editing} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["prof-entregas"] }); }} />}
    </AppShell>
  );
}

function CorrigirModal({ entrega, onClose }: { entrega: any; onClose: () => void }) {
  const [nota, setNota] = useState(entrega.nota != null ? String(entrega.nota) : "");
  const [coment, setComent] = useState(entrega.comentario_prof ?? "");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("entregas").update({ nota: nota === "" ? null : Number(nota), comentario_prof: coment || null }).eq("id", entrega.id);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Correção salva"); onClose();
  }
  return (
    <Modal open onClose={onClose} title={`Corrigir — ${entrega.profiles?.full_name ?? "Aluno"}`}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nota (0 a 10)" value={nota} onChange={setNota} type="number" />
        <Field label="Comentário" value={coment} onChange={setComent} rows={3} />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}
