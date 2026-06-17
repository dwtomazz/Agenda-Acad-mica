import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/admin/comunicados")({
  component: () => (
    <AppShell title="Comunicados">
      <Card>
        <p className="text-sm">Os comunicados institucionais e por turma são publicados na tela <Link to="/avisos" className="text-primary hover:underline">Avisos</Link>. Selecione o escopo <b>Institucional</b> para enviar a todos os usuários.</p>
      </Card>
      <div className="mt-4">
        <Link to="/avisos" className="block rounded-xl px-4 py-3 text-center text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>Ir para Avisos</Link>
      </div>
    </AppShell>
  ),
});