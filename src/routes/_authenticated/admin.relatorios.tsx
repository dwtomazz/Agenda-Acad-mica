import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, SectionTitle, Empty, Badge, GhostButton } from "@/components/ui-bits";
import { useDemoList } from "@/hooks/useDemoData";
import { KEYS, type Usuario, type Turma, type Disciplina, type Atividade } from "@/lib/demoStore";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/relatorios")({ component: Relatorios });

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => escape(r[c])).join(","))].join("\n");
}
function download(name: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function Relatorios() {
  const usuarios = useDemoList<Usuario>(KEYS.usuarios);
  const turmas = useDemoList<Turma>(KEYS.turmas);
  const disc = useDemoList<Disciplina>(KEYS.disciplinas);
  const ativ = useDemoList<Atividade>(KEYS.atividades);
  const [aba, setAba] = useState<"alunos" | "professores" | "turmas" | "disciplinas" | "atividades">("alunos");

  const alunos = usuarios.filter((u) => u.perfil === "aluno");
  const profs = usuarios.filter((u) => u.perfil === "professor");

  const groups: any = {
    alunos: { label: "Alunos", rows: alunos.map((u) => ({ id: u.id, nome: u.nome, email: u.email, ativo: u.ativo })) },
    professores: { label: "Professores", rows: profs.map((u) => ({ id: u.id, nome: u.nome, email: u.email, ativo: u.ativo })) },
    turmas: { label: "Turmas", rows: turmas.map((t) => ({ id: t.id, nome: t.nome, ano: t.ano, periodo: t.periodo, alunos: t.alunos.length, profs: t.professores.length })) },
    disciplinas: { label: "Disciplinas", rows: disc.map((d) => ({ id: d.id, nome: d.nome, codigo: d.codigo, turma: turmas.find((t) => t.id === d.turma_id)?.nome ?? "—", professor: usuarios.find((u) => u.id === d.professor_id)?.nome ?? "—" })) },
    atividades: { label: "Atividades", rows: ativ.map((a) => ({ id: a.id, titulo: a.titulo, tipo: a.tipo, prazo: a.prazo, turma: turmas.find((t) => t.id === a.turma_id)?.nome ?? "—" })) },
  };

  const cur = groups[aba];

  return (
    <AppShell title="Relatórios">
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {Object.entries(groups).map(([k, g]: any) => (
          <button key={k} onClick={() => setAba(k as any)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${aba === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{g.label} ({g.rows.length})</button>
        ))}
      </div>

      <div className="mb-3"><GhostButton onClick={() => download(`${aba}.csv`, toCSV(cur.rows))}><Download size={14}/> Baixar CSV</GhostButton></div>

      <SectionTitle action={<Badge>{cur.rows.length}</Badge>}>{cur.label}</SectionTitle>
      {cur.rows.length ? cur.rows.map((r: any) => (
        <Card key={r.id} className="mb-1">
          <p className="text-sm font-semibold">{r.nome ?? r.titulo}</p>
          <p className="text-xs text-muted-foreground">{Object.entries(r).filter(([k]) => !["id", "nome", "titulo"].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>
        </Card>
      )) : <Empty>—</Empty>}
    </AppShell>
  );
}