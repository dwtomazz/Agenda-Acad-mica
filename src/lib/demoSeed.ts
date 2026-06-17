import { demoStore, KEYS, type Usuario, type Turma, type Disciplina, type Atividade, type Aviso, type Evento, type Nota, type Frequencia } from "./demoStore";

const SEED_FLAG = "demo_seed_v2";

export function ensureSeed() {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(SEED_FLAG)) { ensureDemoUsers(); return; }
  localStorage.setItem(SEED_FLAG, "1");

  const now = new Date();
  const inDays = (d: number, h = 9) => {
    const x = new Date(now); x.setDate(x.getDate() + d); x.setHours(h, 0, 0, 0); return x.toISOString();
  };

  const usuarios: Usuario[] = [
    { id: "demo-administrador", nome: "Administrador Demo", email: "admin@demo.local", perfil: "administrador", ativo: true, foto: null, senha: "demo123" },
    { id: "demo-professor", nome: "Professor Demo", email: "professor@demo.local", perfil: "professor", ativo: true, foto: null, senha: "demo123" },
    { id: "demo-aluno", nome: "Aluno Demo", email: "aluno@demo.local", perfil: "aluno", ativo: true, foto: null, senha: "demo123" },
    { id: "prof-2", nome: "Carla Mendes", email: "carla@demo.local", perfil: "professor", ativo: true, senha: "demo123" },
    { id: "prof-3", nome: "Ricardo Souza", email: "ricardo@demo.local", perfil: "professor", ativo: true, senha: "demo123" },
    { id: "aluno-2", nome: "Beatriz Lima", email: "beatriz@demo.local", perfil: "aluno", ativo: true, senha: "demo123" },
    { id: "aluno-3", nome: "João Pedro", email: "joao@demo.local", perfil: "aluno", ativo: true, senha: "demo123" },
    { id: "aluno-4", nome: "Marina Costa", email: "marina@demo.local", perfil: "aluno", ativo: true, senha: "demo123" },
    { id: "aluno-5", nome: "Lucas Almeida", email: "lucas@demo.local", perfil: "aluno", ativo: true, senha: "demo123" },
  ];
  demoStore.replaceAll(KEYS.usuarios, usuarios.map((u) => ({ ...u, created_at: now.toISOString() })));

  const turmas: Turma[] = [
    {
      id: "turma-1", nome: "9º Ano A", ano: 2026, periodo: "Matutino",
      professores: ["demo-professor", "prof-2"],
      alunos: ["demo-aluno", "aluno-2", "aluno-3", "aluno-4"],
      created_at: now.toISOString(),
    },
    {
      id: "turma-2", nome: "8º Ano B", ano: 2026, periodo: "Vespertino",
      professores: ["demo-professor", "prof-3"],
      alunos: ["aluno-2", "aluno-5"],
      created_at: now.toISOString(),
    },
  ];
  demoStore.replaceAll(KEYS.turmas, turmas);

  const disciplinas: Disciplina[] = [
    { id: "disc-1", nome: "Matemática", codigo: "MAT9", turma_id: "turma-1", professor_id: "demo-professor", carga_horaria: 80, dia_semana: 1, hora_inicio: "07:30", hora_fim: "09:00" },
    { id: "disc-2", nome: "Português", codigo: "POR9", turma_id: "turma-1", professor_id: "prof-2", carga_horaria: 80, dia_semana: 2, hora_inicio: "07:30", hora_fim: "09:00" },
    { id: "disc-3", nome: "Ciências", codigo: "CIE9", turma_id: "turma-1", professor_id: "demo-professor", carga_horaria: 60, dia_semana: 3, hora_inicio: "09:15", hora_fim: "10:45" },
    { id: "disc-4", nome: "História", codigo: "HIS8", turma_id: "turma-2", professor_id: "prof-3", carga_horaria: 60, dia_semana: 1, hora_inicio: "13:30", hora_fim: "15:00" },
    { id: "disc-5", nome: "Geografia", codigo: "GEO8", turma_id: "turma-2", professor_id: "demo-professor", carga_horaria: 60, dia_semana: 4, hora_inicio: "13:30", hora_fim: "15:00" },
  ];
  demoStore.replaceAll(KEYS.disciplinas, disciplinas.map((d) => ({ ...d, created_at: now.toISOString() })));

  const atividades: Atividade[] = [
    { id: "ativ-1", titulo: "Lista de exercícios — Equações do 2º grau", descricao: "Resolver os exercícios 1 a 12 do capítulo 4.", disciplina_id: "disc-1", turma_id: "turma-1", prazo: inDays(3, 23), tipo: "exercicio", criada_por: "demo-professor" },
    { id: "ativ-2", titulo: "Redação — Meio ambiente", descricao: "Texto dissertativo de 25 a 30 linhas.", disciplina_id: "disc-2", turma_id: "turma-1", prazo: inDays(7, 23), tipo: "trabalho", criada_por: "prof-2" },
    { id: "ativ-3", titulo: "Prova de Ciências", descricao: "Conteúdo: células e tecidos.", disciplina_id: "disc-3", turma_id: "turma-1", prazo: inDays(10, 9), tipo: "prova", criada_por: "demo-professor" },
    { id: "ativ-4", titulo: "Seminário — 2ª Guerra", descricao: "Apresentação em grupo, 15 minutos.", disciplina_id: "disc-4", turma_id: "turma-2", prazo: inDays(14, 9), tipo: "seminario", criada_por: "prof-3" },
  ];
  demoStore.replaceAll(KEYS.atividades, atividades.map((a) => ({ ...a, created_at: now.toISOString() })));

  const avisos: Aviso[] = [
    { id: "av-1", titulo: "Reunião de pais", conteudo: "A reunião de pais acontecerá no próximo sábado, às 9h, no auditório.", escopo: "geral", autor_id: "demo-administrador", autor_nome: "Administrador", autor_perfil: "administrador" },
    { id: "av-2", titulo: "Prova adiada", conteudo: "A prova de Ciências foi adiada em dois dias.", escopo: "turma", turma_id: "turma-1", autor_id: "demo-professor", autor_nome: "Professor Demo", autor_perfil: "professor" },
  ];
  demoStore.replaceAll(KEYS.avisos, avisos.map((a) => ({ ...a, created_at: now.toISOString() })));

  const eventos: Evento[] = [
    { id: "ev-1", titulo: "Feira de Ciências", descricao: "Apresentação dos projetos no pátio.", data: inDays(20, 8), tipo: "institucional", turma_id: null, criado_por: "demo-administrador" },
    { id: "ev-2", titulo: "Prova de Ciências", descricao: "Conteúdo: células e tecidos.", data: inDays(10, 9), tipo: "prova", turma_id: "turma-1", criado_por: "demo-professor" },
    { id: "ev-3", titulo: "Seminário 2ª Guerra", descricao: "Apresentações em grupo.", data: inDays(14, 9), tipo: "seminario", turma_id: "turma-2", criado_por: "prof-3" },
  ];
  demoStore.replaceAll(KEYS.eventos, eventos.map((e) => ({ ...e, created_at: now.toISOString() })));

  const notas: Nota[] = [
    { id: "n1", aluno_id: "demo-aluno", disciplina_id: "disc-1", valor: 8.5, peso: 2, tipo: "prova", periodo: "1º bimestre", descricao: "Prova 1" },
    { id: "n2", aluno_id: "demo-aluno", disciplina_id: "disc-1", valor: 7.0, peso: 1, tipo: "trabalho", periodo: "1º bimestre", descricao: "Trabalho em grupo" },
    { id: "n3", aluno_id: "demo-aluno", disciplina_id: "disc-2", valor: 9.0, peso: 2, tipo: "prova", periodo: "1º bimestre", descricao: "Prova de leitura" },
    { id: "n4", aluno_id: "demo-aluno", disciplina_id: "disc-3", valor: 6.5, peso: 2, tipo: "prova", periodo: "1º bimestre", descricao: "Prova 1" },
  ];
  demoStore.replaceAll(KEYS.notas, notas.map((n) => ({ ...n, created_at: now.toISOString() })));

  // 10 dias de frequência por disciplina do aluno
  const freq: Frequencia[] = [];
  for (const disc of ["disc-1", "disc-2", "disc-3"]) {
    for (let i = 0; i < 10; i++) {
      freq.push({ id: `f-${disc}-${i}`, aluno_id: "demo-aluno", disciplina_id: disc, data: inDays(-i - 1), presente: i !== 2 && i !== 7 });
    }
  }
  demoStore.replaceAll(KEYS.frequencias, freq);

  demoStore.replaceAll(KEYS.concluidas, []);
  demoStore.replaceAll(KEYS.notificacoes, []);
  demoStore.replaceAll(KEYS.config, [
    { id: "cfg", nome_sistema: "Agenda Acadêmica", notif_email: true, notif_push: true, permitir_auto_cadastro: false },
  ]);
}

// caso o usuário tenha limpado só a coleção de usuários
function ensureDemoUsers() {
  const list = demoStore.list<Usuario>(KEYS.usuarios);
  const ids = new Set(list.map((u) => u.id));
  const required: Usuario[] = [
    { id: "demo-administrador", nome: "Administrador Demo", email: "admin@demo.local", perfil: "administrador", ativo: true, senha: "demo123" },
    { id: "demo-professor", nome: "Professor Demo", email: "professor@demo.local", perfil: "professor", ativo: true, senha: "demo123" },
    { id: "demo-aluno", nome: "Aluno Demo", email: "aluno@demo.local", perfil: "aluno", ativo: true, senha: "demo123" },
  ];
  for (const r of required) if (!ids.has(r.id)) demoStore.create(KEYS.usuarios, r, { id: r.id });
}