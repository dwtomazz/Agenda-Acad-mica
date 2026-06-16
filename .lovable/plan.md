## Causa

O login está em **modo demo** (sem autenticação real — só `localStorage.demo_auth`), mas as telas de administrador ainda tentam gravar diretamente no banco. Como não existe um usuário autenticado de verdade, as políticas de segurança do banco bloqueiam qualquer `INSERT`/`UPDATE`/`DELETE` de disciplinas, turmas e avisos — por isso "salvar" não faz nada (ou aparece erro de permissão).

## Solução

Manter o modo demo coerente: trocar as gravações dessas telas por um **armazenamento local no próprio navegador** (`localStorage`), do mesmo jeito que o login demo já funciona. Assim o administrador consegue criar, editar e excluir normalmente, sem depender do banco.

### Escopo das alterações

Criar um pequeno utilitário `src/lib/demoStore.ts` com funções `list / create / update / remove` por "coleção" (disciplinas, turmas, avisos), persistidas em `localStorage` com IDs gerados localmente.

Trocar as chamadas `supabase.from(...)` por esse utilitário em:

1. `src/routes/_authenticated/admin.disciplinas.tsx` — listar/criar/editar/excluir disciplinas.
2. `src/routes/_authenticated/admin.turmas.tsx` — listar/criar/editar/excluir turmas (e seleção de disciplina vinda do store local).
3. `src/routes/_authenticated/admin.comunicados.tsx` — listar/criar/excluir avisos gerais.
4. `src/routes/_authenticated/avisos.tsx` — leitura passa a ler do store local para que os avisos criados pelo admin apareçam para alunos/professores na mesma sessão/navegador.
5. `src/routes/_authenticated/turmas.tsx` — leitura passa a usar o store local para que as turmas criadas pelo admin apareçam na lista.

Nenhuma alteração no banco e nenhuma mexida em login, layout ou outras telas.

### Limitação esperada

Como é modo demo, os dados ficam **apenas no navegador atual** — não sincronizam entre dispositivos nem entre usuários. É o comportamento coerente com o login demo. Quando quiser ligar o sistema real (login + banco), reativamos a autenticação e voltamos a gravar no banco.
