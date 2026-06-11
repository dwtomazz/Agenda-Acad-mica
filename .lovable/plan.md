
## Visão geral

Vou refazer o app como **Mentora**, com dois papéis (Aluno e Mentor), turmas, chat em tempo real, materiais, tarefas, calendário e avisos. Toda persistência usa Lovable Cloud (banco + auth + storage). A identidade visual atual (tema azul escuro, AppShell) é mantida e reaproveitada.

## Fluxos cobertos (dos diagramas)

**Comuns**
- Cadastro / Login (e-mail+senha e Google), com escolha de papel (Aluno ou Mentor)
- Meu Perfil (editar nome, foto, bio; trocar senha; sair)
- Avisos e notificações (lista global + por turma)
- Calendário de aulas (eventos da turma)

**Aluno**
- Dashboard: próximas aulas, materiais recentes, mensagens não lidas
- Procurar mentores (busca por nome/área) → ver perfil → solicitar entrada em turma
- Minhas turmas → Tela de Turma (chat, materiais, avisos, calendário)
- Enviar tarefas (upload de arquivo + texto)
- Lançar dúvida no chat da turma
- Visualizar materiais (atividades, links, aulas gravadas)

**Mentor**
- Dashboard: visão geral das turmas, últimos avisos, atalhos
- Gerenciar turmas: criar, editar, adicionar/remover alunos
- Lançar avisos e notificações (turma ou geral)
- Enviar materiais (link, arquivo, aula gravada)
- Corrigir tarefas (lista de entregas, dar nota + feedback)
- Responder dúvidas no chat
- Agendar aulas no calendário

## Telas (rotas)

Públicas: `/` (landing Mentora), `/auth` (login + cadastro com escolha de papel)

Autenticadas (`/_authenticated/...`):
- `/home` — dashboard que renderiza Aluno ou Mentor conforme papel
- `/avisos`, `/avisos/novo` (mentor)
- `/calendario`, `/calendario/novo` (mentor)
- `/mentores` (busca — só aluno), `/mentores/$id`
- `/turmas` (lista), `/turmas/nova` (mentor), `/turmas/$id` (tabs: Chat • Materiais • Avisos • Calendário • Alunos • Tarefas)
- `/turmas/$id/materiais/novo` (mentor)
- `/turmas/$id/tarefas` e `/turmas/$id/tarefas/$tid` (enviar/corrigir)
- `/conta` (perfil), `/sair`

## Backend (Lovable Cloud)

Tabelas (com RLS):
- `profiles` (id=auth.uid, nome, bio, avatar_url, área de atuação)
- `user_roles` (enum: `aluno`, `mentor`) + função `has_role` (padrão seguro)
- `classes` (turma: id, mentor_id, título, descrição, área, capa)
- `class_members` (turma↔aluno, status: pendente/aprovado)
- `messages` (chat da turma, realtime)
- `materials` (tipo: link/arquivo/aula_gravada, url, descrição)
- `assignments` (tarefa: título, descrição, prazo)
- `submissions` (entrega: aluno_id, arquivo, texto, nota, feedback)
- `announcements` (avisos: escopo turma ou geral)
- `events` (calendário: turma, data, título, tipo)
- `notifications` (por usuário, lida/não-lida)

Storage buckets: `avatars`, `materials`, `submissions`.

Auth: e-mail+senha + Google. Após signup, trigger cria `profile` e `user_role` com o papel escolhido.

Chat em tempo real: Postgres Realtime na tabela `messages`.

Server functions (`createServerFn`): criar turma, aprovar aluno, enviar material, lançar aviso, criar evento, submeter/corrigir tarefa. Server functions privilegiadas verificam papel (`has_role`) antes de agir.

## Detalhes técnicos

- Ativar Lovable Cloud + configurar provedor Google via integração.
- Migration única criando enum `app_role`, tabelas, RLS, função `has_role`, trigger `handle_new_user`, buckets de storage e políticas.
- `src/routes/_authenticated/route.tsx` (gate gerenciado pela integração) protege todo o app.
- `useUserRole()` hook lê `user_roles` para alternar UI Aluno/Mentor.
- AppShell ganha nav diferente por papel (Aluno: Início, Mentores, Turmas, Avisos, Conta; Mentor: Início, Turmas, Avisos, Calendário, Conta).
- Reaproveitar rotas atuais (`avisos`, `calendario`, `conta`, `sair`) plugando dados reais; remover `notas`/`trabalhos` antigos (substituídos por `assignments`/`submissions` dentro de turmas).
- TanStack Query para leituras (loader `ensureQueryData` + `useSuspenseQuery`); mutations invalidam chaves relevantes.
- Uploads via Storage com URLs assinadas para `submissions` e `materials` privados.

## Escopo fora deste plano

- Vídeo ao vivo (somente upload de aulas gravadas)
- Pagamentos/assinatura de mentorias
- App mobile nativo
