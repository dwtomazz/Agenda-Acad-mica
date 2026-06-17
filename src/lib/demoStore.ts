const PREFIX = "demo_store_";

function read<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(PREFIX + key) || "[]"); } catch { return []; }
}
function write<T>(key: string, items: T[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PREFIX + key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("demo-store-change", { detail: key }));
}
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

export const demoStore = {
  list<T = any>(key: string): T[] { return read<T>(key); },
  get<T = any>(key: string, id: string): T | undefined {
    return read<any>(key).find((r) => r.id === id);
  },
  query<T = any>(key: string, pred: (r: T) => boolean): T[] {
    return read<T>(key).filter(pred);
  },
  create<T extends Record<string, any>>(key: string, item: T, opts?: { id?: string }): T & { id: string; created_at: string } {
    const row = { id: opts?.id ?? uid(), created_at: new Date().toISOString(), ...item } as any;
    write(key, [...read(key), row]);
    return row;
  },
  upsert<T extends Record<string, any>>(key: string, item: T & { id: string }) {
    const all = read<any>(key);
    const i = all.findIndex((r) => r.id === item.id);
    if (i >= 0) all[i] = { ...all[i], ...item };
    else all.push({ created_at: new Date().toISOString(), ...item });
    write(key, all);
  },
  update<T extends Record<string, any>>(key: string, id: string, patch: Partial<T>) {
    write(key, read<any>(key).map((r) => (r.id === id ? { ...r, ...patch } : r)));
  },
  remove(key: string, id: string) {
    write(key, read<any>(key).filter((r) => r.id !== id));
  },
  replaceAll<T>(key: string, items: T[]) { write(key, items); },
};

export const KEYS = {
  usuarios: "usuarios",
  turmas: "turmas",
  disciplinas: "disciplinas",
  atividades: "atividades",
  entregas: "entregas",
  avisos: "avisos",
  eventos: "eventos",
  notas: "notas",
  frequencias: "frequencias",
  concluidas: "concluidas",
  notificacoes: "notificacoes",
  config: "config",
} as const;

export type Usuario = {
  id: string; nome: string; email: string;
  perfil: "aluno" | "professor" | "administrador";
  ativo: boolean; foto?: string | null; senha?: string;
  created_at?: string;
};
export type Turma = {
  id: string; nome: string; ano: number; periodo: string;
  professores: string[]; alunos: string[]; created_at?: string;
};
export type Disciplina = {
  id: string; nome: string; codigo: string;
  turma_id: string; professor_id: string | null;
  carga_horaria: number; dia_semana: number; hora_inicio: string; hora_fim: string;
  created_at?: string;
};
export type Atividade = {
  id: string; titulo: string; descricao: string;
  disciplina_id: string | null; turma_id: string;
  prazo: string; tipo: "trabalho" | "prova" | "seminario" | "exercicio";
  criada_por: string; created_at?: string;
};
export type Aviso = {
  id: string; titulo: string; conteudo: string;
  escopo: "geral" | "turma"; turma_id?: string | null;
  autor_id: string; autor_nome: string; autor_perfil: string;
  created_at?: string;
};
export type Evento = {
  id: string; titulo: string; descricao: string;
  data: string; tipo: "prova" | "trabalho" | "seminario" | "institucional";
  turma_id?: string | null; criado_por: string; created_at?: string;
};
export type Nota = {
  id: string; aluno_id: string; disciplina_id: string;
  valor: number; peso: number; tipo: string; periodo: string;
  descricao: string; created_at?: string;
};
export type Frequencia = {
  id: string; aluno_id: string; disciplina_id: string;
  data: string; presente: boolean; created_at?: string;
};
export type Notificacao = {
  id: string; usuario_id: string; titulo: string; mensagem: string;
  lida: boolean; tipo: "atividade" | "aviso" | "evento" | "geral";
  link?: string; created_at?: string;
};

export function notificar(usuarios: string[], n: Omit<Notificacao, "id" | "usuario_id" | "lida" | "created_at">) {
  for (const uId of usuarios) {
    demoStore.create<Notificacao>(KEYS.notificacoes, { ...n, usuario_id: uId, lida: false } as any);
  }
}