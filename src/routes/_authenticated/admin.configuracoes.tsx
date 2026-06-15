import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/configuracoes")({ component: Conf });

function Conf() {
  return (
    <AppShell title="Configurações">
      <Card className="mb-3">
        <SectionTitle>Sistema</SectionTitle>
        <p className="text-sm text-muted-foreground">Agenda Acadêmica — versão 1.0</p>
      </Card>
      <Card className="mb-3">
        <SectionTitle>Controle de acesso</SectionTitle>
        <p className="text-sm text-muted-foreground">Promova novos administradores enviando o código atual de promoção:</p>
        <p className="mt-2 select-all rounded-xl bg-secondary p-2 font-mono text-sm">AGENDA-ADMIN-2026</p>
        <p className="mt-2 text-xs text-muted-foreground">Para alterar o código, edite a função <code>promote_to_admin</code> no banco.</p>
      </Card>
      <Card>
        <SectionTitle>Permissões</SectionTitle>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Aluno — visualização de atividades, notas, frequência, avisos e calendário.</li>
          <li>• Professor — gerencia turmas próprias, atividades, avisos, eventos, notas e frequência.</li>
          <li>• Administrador — acesso total ao sistema.</li>
        </ul>
      </Card>
    </AppShell>
  );
}
