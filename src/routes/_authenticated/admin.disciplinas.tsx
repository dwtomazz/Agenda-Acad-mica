import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, Field, PrimaryButton, Modal } from "@/components/ui-bits";
import { demoStore, KEYS } from "@/lib/demoStore";
import { Library, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/disciplinas")({ component: AdminDisc });

function AdminDisc() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<any | null>(null);
  const disc = useQuery({
    queryKey: ["disciplinas"],
    queryFn: async () => demoStore.list<any>(KEYS.disciplinas).sort((a, b) => a.nome.localeCompare(b.nome)),
  });
  async function del(id: string) {
    if (!confirm("Excluir disciplina?")) return;
    demoStore.remove(KEYS.disciplinas, id);
    qc.invalidateQueries({ queryKey: ["disciplinas"] });
  }
  return (
    <AppShell title="Disciplinas">
      <div className="mb-4"><PrimaryButton onClick={() => setOpen({})} className="w-full"><Plus size={18}/> Nova disciplina</PrimaryButton></div>
      {disc.data?.length ? disc.data.map((d) => (
        <Card key={d.id} className="mb-2 flex items-center gap-3">
          <Library size={18} className="text-primary"/>
          <div className="flex-1"><p className="text-sm font-semibold">{d.nome}</p>{d.codigo && <p className="text-xs text-muted-foreground">{d.codigo}</p>}</div>
          <button onClick={() => setOpen(d)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></button>
          <button onClick={() => del(d.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive"><Trash2 size={14}/></button>
        </Card>
      )) : <Empty>Nenhuma disciplina cadastrada.</Empty>}
      {open && <DiscForm disc={open} onClose={() => { setOpen(null); qc.invalidateQueries({ queryKey: ["disciplinas"] }); }} />}
    </AppShell>
  );
}

function DiscForm({ disc, onClose }: { disc: any; onClose: () => void }) {
  const [nome, setNome] = useState(disc.nome ?? "");
  const [codigo, setCodigo] = useState(disc.codigo ?? "");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (disc.id) demoStore.update(KEYS.disciplinas, disc.id, { nome, codigo: codigo || null });
    else demoStore.create(KEYS.disciplinas, { nome, codigo: codigo || null });
    setLoading(false);
    toast.success("Salvo"); onClose();
  }
  return (
    <Modal open onClose={onClose} title={disc.id ? "Editar disciplina" : "Nova disciplina"}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <Field label="Código" value={codigo} onChange={setCodigo} placeholder="opcional" />
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}
