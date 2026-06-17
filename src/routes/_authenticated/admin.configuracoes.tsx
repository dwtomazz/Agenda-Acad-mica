import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, PrimaryButton, Field } from "@/components/ui-bits";
import { demoStore, KEYS } from "@/lib/demoStore";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: Conf });

type Cfg = { id: string; nome_sistema: string; notif_email: boolean; notif_push: boolean; permitir_auto_cadastro: boolean };

function Conf() {
  const [cfg, setCfg] = useState<Cfg>({ id: "cfg", nome_sistema: "Agenda Acadêmica", notif_email: true, notif_push: true, permitir_auto_cadastro: false });
  useEffect(() => {
    const list = demoStore.list<Cfg>(KEYS.config);
    if (list[0]) setCfg(list[0]);
  }, []);

  function save() {
    demoStore.upsert(KEYS.config, cfg);
    toast.success("Configurações salvas");
  }

  function reset() {
    if (!confirm("Limpar todos os dados de demonstração? A página será recarregada.")) return;
    Object.keys(localStorage).filter((k) => k.startsWith("demo_")).forEach((k) => localStorage.removeItem(k));
    location.reload();
  }

  return (
    <AppShell title="Configurações">
      <Card className="mb-3">
        <SectionTitle>Geral</SectionTitle>
        <Field label="Nome do sistema" value={cfg.nome_sistema} onChange={(v) => setCfg({ ...cfg, nome_sistema: v })} />
      </Card>
      <Card className="mb-3">
        <SectionTitle>Notificações</SectionTitle>
        <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.notif_email} onChange={(e) => setCfg({ ...cfg, notif_email: e.target.checked })} /> Enviar notificações por e-mail</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.notif_push} onChange={(e) => setCfg({ ...cfg, notif_push: e.target.checked })} /> Enviar notificações push</label>
      </Card>
      <Card className="mb-3">
        <SectionTitle>Acesso</SectionTitle>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cfg.permitir_auto_cadastro} onChange={(e) => setCfg({ ...cfg, permitir_auto_cadastro: e.target.checked })} /> Permitir auto-cadastro de alunos</label>
      </Card>
      <Card className="mb-3">
        <SectionTitle>Permissões</SectionTitle>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Aluno — atividades, notas, frequência, avisos, calendário, horários.</li>
          <li>• Professor — gerencia atividades, avisos, eventos e entregas das suas turmas.</li>
          <li>• Administrador — acesso total: usuários, turmas, disciplinas, relatórios e configurações.</li>
        </ul>
      </Card>
      <div className="flex gap-2">
        <PrimaryButton onClick={save} className="flex-1">Salvar</PrimaryButton>
      </div>
      <div className="mt-6"><button onClick={reset} className="w-full text-xs text-destructive hover:underline">Limpar dados de demonstração</button></div>
    </AppShell>
  );
}