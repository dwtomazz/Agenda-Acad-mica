import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, SectionTitle, Badge, Field, SelectField, PrimaryButton, Modal } from "@/components/ui-bits";
import { useDemoList } from "@/hooks/useDemoData";
import { demoStore, KEYS, type Usuario } from "@/lib/demoStore";
import { Pencil, Power, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({ component: AdminUsuarios });

function AdminUsuarios() {
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const [editing, setEditing] = useState<Usuario | { __new: true } | null>(null);
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => usuarios.filter((u) => !busca || u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())), [usuarios, busca]);
  const admins = lista.filter((u) => u.perfil === "administrador");
  const profs = lista.filter((u) => u.perfil === "professor");
  const alunos = lista.filter((u) => u.perfil === "aluno");

  function toggle(u: Usuario) { demoStore.update(KEYS.usuarios, u.id, { ativo: !u.ativo }); }
  function del(u: Usuario) {
    if (u.id.startsWith("demo-")) { toast.error("Não é possível excluir usuário demo."); return; }
    if (!confirm("Excluir usuário?")) return;
    demoStore.remove(KEYS.usuarios, u.id);
    toast.success("Excluído");
  }

  return (
    <AppShell title="Usuários">
      <div className="mb-3"><PrimaryButton onClick={() => setEditing({ __new: true } as any)} className="w-full"><Plus size={18}/> Novo usuário</PrimaryButton></div>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3">
        <Search size={16} className="text-muted-foreground"/>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar usuário…" className="h-10 flex-1 bg-transparent text-sm outline-none"/>
      </div>
      {[{ t: "Administradores", l: admins }, { t: "Professores", l: profs }, { t: "Alunos", l: alunos }].map((g) => (
        <section key={g.t} className="mb-5">
          <SectionTitle action={<Badge>{g.l.length}</Badge>}>{g.t}</SectionTitle>
          {g.l.length ? g.l.map((p) => (
            <Card key={p.id} className="mb-2 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary">{p.nome[0]?.toUpperCase()}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.email} · {p.ativo ? "Ativo" : "Desativado"}</p>
              </div>
              <button onClick={() => setEditing(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"><Pencil size={14}/></button>
              <button onClick={() => toggle(p)} className={`grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary ${p.ativo ? "text-destructive" : "text-emerald-400"}`} title={p.ativo ? "Desativar" : "Ativar"}><Power size={14}/></button>
              <button onClick={() => del(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-border text-destructive hover:bg-secondary"><Trash2 size={14}/></button>
            </Card>
          )) : <Empty>Nenhum.</Empty>}
        </section>
      ))}
      {editing && <EditUser u={"__new" in editing ? null : editing} onClose={() => setEditing(null)} />}
    </AppShell>
  );
}

function EditUser({ u, onClose }: { u: Usuario | null; onClose: () => void }) {
  const [nome, setNome] = useState(u?.nome ?? "");
  const [email, setEmail] = useState(u?.email ?? "");
  const [perfil, setPerfil] = useState<Usuario["perfil"]>(u?.perfil ?? "aluno");
  const [ativo, setAtivo] = useState(u?.ativo ?? true);
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    if (u) {
      const patch: any = { nome, email, perfil, ativo };
      if (senha) patch.senha = senha;
      demoStore.update(KEYS.usuarios, u.id, patch);
    } else {
      demoStore.create<Usuario>(KEYS.usuarios, { nome, email, perfil, ativo, senha: senha || "demo123", foto: null } as any);
    }
    setLoading(false); toast.success("Usuário salvo"); onClose();
  }
  return (
    <Modal open onClose={onClose} title={u ? "Editar usuário" : "Novo usuário"}>
      <form onSubmit={save} className="space-y-3">
        <Field label="Nome" value={nome} onChange={setNome} required />
        <Field label="E-mail" value={email} onChange={setEmail} type="email" required />
        <SelectField label="Perfil" value={perfil} onChange={(v) => setPerfil(v as any)} required options={[
          { value: "aluno", label: "Aluno" }, { value: "professor", label: "Professor" }, { value: "administrador", label: "Administrador" },
        ]} />
        <Field label={u ? "Nova senha (opcional)" : "Senha"} value={senha} onChange={setSenha} type="password" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Usuário ativo</label>
        <PrimaryButton type="submit" loading={loading}>Salvar</PrimaryButton>
      </form>
    </Modal>
  );
}