import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, Field, PrimaryButton } from "@/components/ui-bits";
import { useDemoUser } from "@/hooks/useDemoData";
import { demoStore, KEYS } from "@/lib/demoStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/perfil")({ component: Perfil });

function Perfil() {
  const me = useDemoUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState(me?.nome ?? "");
  const [email, setEmail] = useState(me?.email ?? "");
  const [foto, setFoto] = useState<string | null>(me?.foto ?? null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;
    setNome(me.nome); setEmail(me.email); setFoto(me.foto ?? null);
  }, [me?.id]);

  if (!me) return null;

  function onFoto(file: File) {
    const r = new FileReader();
    r.onload = () => setFoto(String(r.result));
    r.readAsDataURL(file);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (senhaNova) {
      if (senhaAtual !== me!.senha) { setSaving(false); toast.error("Senha atual incorreta"); return; }
      demoStore.update(KEYS.usuarios, me!.id, { nome, email, foto, senha: senhaNova });
      setSenhaAtual(""); setSenhaNova("");
    } else {
      demoStore.update(KEYS.usuarios, me!.id, { nome, email, foto });
    }
    setSaving(false); toast.success("Perfil atualizado");
  }

  const initial = (nome || email || "?")[0].toUpperCase();

  return (
    <AppShell title="Perfil" back="/home">
      <Card>
        <form onSubmit={save} className="space-y-3">
          <div className="flex items-center gap-3">
            {foto ? (
              <img src={foto} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary">{initial}</div>
            )}
            <div className="flex-1">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline">Alterar foto</button>
              {foto && <button type="button" onClick={() => setFoto(null)} className="ml-3 text-xs text-destructive hover:underline">Remover</button>}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files && onFoto(e.target.files[0])} />
              <p className="mt-1 text-xs uppercase text-muted-foreground">{me.perfil}</p>
            </div>
          </div>
          <Field label="Nome completo" value={nome} onChange={setNome} required />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" required />
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-sm font-semibold">Alterar senha (opcional)</p>
            <Field label="Senha atual" value={senhaAtual} onChange={setSenhaAtual} type="password" />
            <div className="h-2"/>
            <Field label="Nova senha" value={senhaNova} onChange={setSenhaNova} type="password" />
          </div>
          <PrimaryButton type="submit" loading={saving}>Salvar alterações</PrimaryButton>
        </form>
      </Card>
    </AppShell>
  );
}