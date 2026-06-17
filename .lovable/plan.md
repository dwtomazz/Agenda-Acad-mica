# Plano: Sistema acadêmico completo em modo demo

O login continua "fake" (clicar em Entrar como aluno/professor/admin já loga). Toda persistência continua em `localStorage` via um `demoStore` ampliado — sem mexer no banco. O fluxo obrigatório do enunciado (admin cria → vincula → aluno/professor vê) será aplicado.

## 1. Expansão do `demoStore`

Coleções (todas em `localStorage`, com IDs locais e timestamps):
- `usuarios` (id, nome, email, perfil: aluno/professor/admin, ativo, foto, senha-mock)
- `turmas` (id, nome, ano, periodo, professores: id[], alunos: id[])
- `disciplinas` (id, nome, codigo, turma_id, professor_id, carga_horaria)
- `atividades` (id, titulo, descricao, disciplina_id, turma_id, prazo, tipo: prova/trabalho/seminario)
- `entregas` (id, atividade_id, aluno_id, status, data_envio, nota)
- `avisos` (id, titulo, conteudo, escopo: global/turma, turma_id?, autor_id, autor_perfil, data)
- `eventos` (id, titulo, descricao, data, tipo: prova/trabalho/seminario/institucional, turma_id?)
- `notas` (id, aluno_id, disciplina_id, valor, periodo, tipo)
- `frequencias` (id, aluno_id, disciplina_id, data, presente)
- `concluidas` (aluno_id + atividade_id)
- `notificacoes` (id, usuario_id, titulo, lida, data, tipo)
- `perfil_atual` (nome, email, foto, senha por perfil de demo)

Helpers: `list/get/create/update/remove/query` + seed inicial mínimo (1 admin, 2 professores, 4 alunos, 2 turmas, 4 disciplinas, algumas atividades/avisos/eventos) para que o app não pareça vazio na primeira visita.

## 2. Regra de vinculação

Hook `useDemoUser()` devolve o usuário-demo atual (lido do `localStorage.demo_auth` + `usuarios`). Componente `<RequireTurma>` que envolve telas de aluno/professor: se o usuário não está em nenhuma turma, mostra:

> "Você ainda não foi vinculado a uma turma. Entre em contato com a administração."

Aplicado em: Atividades, Calendário (parte de turma), Avisos (parte de turma), Notas, Frequência, Horários, Entregas, Turmas.

## 3. Telas do Aluno

- **Dashboard (`/home`)**: resumo da semana, próximas atividades/provas, avisos recentes, mini-calendário — tudo lendo do store filtrado pelas turmas do aluno.
- **Atividades (`/atividades`)**: lista + filtros (disciplina, prazo, status), detalhe em modal/rota, botão "Marcar como concluída".
- **Calendário (`/calendario`)**: eventos das turmas do aluno + institucionais.
- **Avisos (`/avisos`)**: globais + das turmas + busca.
- **Notas (`/notas`)**: notas + frequência + situação (aprovado/recuperação/reprovado) + filtro por período.
- **Horários (`/horarios`)**: grade semanal gerada a partir das disciplinas das turmas.
- **Perfil (`/perfil`)**: editar nome/email/foto/senha (mock).

## 4. Telas do Professor

- **Dashboard**: resumo das turmas vinculadas, atividades criadas, entregas pendentes, avisos publicados.
- **Turmas (`/turmas`, `/turmas/$id`)**: somente turmas onde é professor, lista de alunos, detalhes.
- **Atividades (`/atividades`, `/atividades/nova`)**: criar/editar/excluir/buscar, vincular turma+disciplina, definir prazo.
- **Entregas (`/entregas`)**: por atividade, status por aluno, lançar nota.
- **Calendário**: criar/editar/excluir eventos (prova/seminário/trabalho) das suas turmas.
- **Avisos**: criar/editar/excluir para suas turmas.
- **Perfil**: igual ao aluno.

## 5. Telas do Administrador

- **Dashboard (`/admin`)**: contadores (alunos, professores, turmas, disciplinas, atividades) + cards de estatísticas (entregas pendentes, avisos ativos).
- **Usuários (`/admin/usuarios`)**: CRUD completo, ativar/desativar, alterar perfil.
- **Turmas (`/admin/turmas`)**: CRUD + vincular professores e alunos (multi-select).
- **Disciplinas (`/admin/disciplinas`)**: CRUD + vincular turma e professor.
- **Comunicados (`/admin/comunicados`)**: CRUD de avisos globais.
- **Relatórios (`/admin/relatorios`)**: tabelas filtráveis por entidade + export CSV simples.
- **Configurações (`/admin/configuracoes`)**: toggles mock (notificações, permissões) salvos no store.

## 6. Funcionalidades gerais

- **Notificações**: sino no header lista `notificacoes` do usuário; geradas automaticamente ao criar atividade/aviso/evento que afete o usuário; marcar como lida.
- **Busca global**: campo no header que pesquisa em usuários (admin), atividades, avisos.
- **Responsividade**: layout do `AppShell` revisado para mobile/tablet/desktop (sidebar colapsa em drawer).
- **Segurança (demo)**: o gate por perfil já bloqueia rotas; senhas armazenadas só como mock — sem promessa real de criptografia.

## 7. Detalhes técnicos

- Tudo continua em modo demo: nenhum `supabase.from(...)` será chamado pelas telas afetadas. O cliente Supabase permanece importado apenas onde já está, mas as telas usam exclusivamente o `demoStore`.
- Nada de migrations novas. Os avisos do `security scan` permanecem como na última correção.
- Arquivos novos:
  - `src/lib/demoStore.ts` (ampliação)
  - `src/lib/demoSeed.ts` (seed inicial idempotente)
  - `src/hooks/useDemoUser.ts`
  - `src/components/RequireTurma.tsx`
  - `src/components/NotificationsBell.tsx`
  - `src/components/GlobalSearch.tsx`
- Arquivos editados: todas as rotas em `src/routes/_authenticated/*`, `AppShell.tsx`, `useAuth.ts` (para expor o usuário demo completo).

## 8. Limitações honestas

- Dados só persistem neste navegador (não sincronizam entre dispositivos nem entre logins do mesmo perfil em máquinas diferentes).
- "Senha" e "criptografia" são simulações visuais — não há segurança real, pois não há backend autenticado.
- O escopo é grande; vou implementar tudo em uma única leva, mas algumas telas terão UI funcional porém enxuta (ex.: relatórios = tabela + export, sem gráficos avançados).

Confirma que posso seguir com essa abordagem?
