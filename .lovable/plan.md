# Login não-funcional (modo demo)

## Objetivo
Na tela `/auth`, ao selecionar um perfil (Aluno, Professor ou Administrador) e clicar em **Entrar**, o usuário entra direto no sistema, sem precisar de e-mail, senha, código de admin ou cadastro. Toda validação de autenticação real é desligada.

## Alterações

### 1. `src/routes/auth.tsx` — simplificar a tela
- Manter a tela de seleção de perfil (3 cards).
- Depois de escolher o perfil, em vez de mostrar formulário de e-mail/senha, mostrar apenas:
  - Nome do perfil selecionado
  - Botão grande **Entrar como {perfil}**
  - Link "← trocar perfil"
- Ao clicar em Entrar: salvar `{ role, name }` em `localStorage` (chave `demo_auth`) e navegar para `/home`.
- Remover formulário, Google, signup, código admin, chamadas ao Supabase.

### 2. `src/routes/_authenticated/route.tsx` — desligar guard real
- Trocar a verificação `supabase.auth.getUser()` por leitura de `localStorage.demo_auth`.
- Se ausente, redirecionar para `/auth`. Sem chamada ao backend.
- Manter `ssr: false`.

### 3. `src/hooks/useAuth.ts` — ler do localStorage
- `useAuth`: retornar um `user` mock `{ id: "demo-{role}", email: "demo@local" }` com base em `localStorage.demo_auth`. Sem listeners do Supabase.
- `useUserRole`: retornar o `role` salvo no localStorage (sem consultar `user_roles`).
- Expor função `signOut()` que limpa o localStorage e redireciona.

### 4. Logout
- Onde houver botão "Sair" (no `AppShell`/perfil), trocar `supabase.auth.signOut()` por limpar `localStorage.demo_auth` e ir para `/auth`.

## Fora do escopo
- Não mexer no banco, em RLS, em migrations, nem nas demais telas (continuam usando os dados que já carregam; algumas chamadas ao Supabase podem retornar vazio porque não há sessão real — isso é esperado no modo demo e pode ser tratado depois se você quiser dados fake).
- Não remover as integrações do Supabase do projeto; apenas a tela de login deixa de usá-las.

## Observação
Isso é um modo de demonstração — qualquer pessoa "entra" como qualquer perfil sem segurança. Avise se em algum momento quiser religar o login real.
