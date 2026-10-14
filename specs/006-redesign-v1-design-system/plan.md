# Plano de Implementação: v1.0 — telas alinhadas ao design system

Objetivo: implementar US1-US2 (Micael, autenticação) e US3-US5 (Maria Clara, navegação e
perfil), seguindo a arquitetura MVVM de sete camadas (ver
[docs/arquitetura.md](../../docs/arquitetura.md)) e os componentes documentados em
[design-system/04-componentes/](../../design-system/04-componentes/), com persistência em
memória como o restante da base.

## Modelo (camada `model`)

- `src/model/entities/user.ts`: estender `User` com `publicName?: string`, `photoUrl?: string`,
  `socialHandle?: string` (US4). Senha continua só na infraestrutura.
- `src/model/validators/authValidator.ts`: reaproveitar a validação de e-mail/senha existente
  para a senha temporária gerada (FR-002) — nenhuma regra nova, só reuso.
- `src/model/datasources/iAuthDataSource.ts`: estender com
  `requestPasswordReset(email: string): Promise<string>` (retorna a senha temporária) e
  `updateProfile(userId: string, patch: Partial<Pick<User, "publicName" | "photoUrl" | "socialHandle">>): Promise<User>`.

## Casos de uso (camada `usecase`)

- `src/usecase/authUseCases.ts`: estender `IAuthUseCases` com
  `requestPasswordReset(email): Promise<string>` — gera a senha temporária (reaproveitando a
  mesma geração de id aleatório já usada em `memoryBookDataSource.ts`, adaptada para string
  alfanumérica de 8+ caracteres), delega ao datasource, converte "e-mail não encontrado" em
  `AuthError` com mensagem neutra (FR-001).
- `src/usecase/authUseCases.ts`: adicionar `updateProfile(userId, patch): Promise<User>`,
  delegando ao datasource (US4).
- `src/usecase/bookUseCases.ts`: nenhuma mudança — a busca (US3) filtra em memória no
  ViewModel, sobre o resultado já retornado por `listBooks()` (FR-005), sem novo método de
  caso de uso.

## Infraestrutura (camada `infra`)

- `src/infra/datasources/memoryAuthDataSource.ts`: implementar `requestPasswordReset` (busca
  por e-mail, gera senha temporária, substitui a senha armazenada, retorna a senha) e
  `updateProfile` (atualiza os campos novos do usuário em memória).

## Composição (camada `di`)

- `src/di/container.ts`: nenhuma mudança de composição — `authUseCases` já é exportado e só
  ganha métodos novos na mesma instância.

## ViewModel

- `src/viewmodel/useAuthViewModel.ts`: adicionar ação `requestPasswordReset(email)` retornando
  a senha temporária (ou lançando erro tratado) para a tela exibir.
- `src/viewmodel/useProfileViewModel.ts` (novo): estado `{ user, loading, error }`, ação
  `updateProfile(patch)`.
- `src/viewmodel/useUserProfileViewModel.ts` (novo): dado um `userId`, retorna o perfil público
  (sem e-mail) e a lista de anúncios dele (filtro de `listBooks()` por `ownerId`).
- `src/viewmodel/useSearchViewModel.ts` (novo): estado `{ term, books, loading, error }` —
  reaproveita `useHomeViewModel`/`listBooks()` internamente e filtra por `term` no cliente
  (FR-005), sem chamada de rede por tecla.

## View (componentes de design system reaproveitáveis)

- `src/view/components/NavigationBar.tsx` (novo): 3 itens (Início, Pesquisa, Perfil), pílula de
  item ativo, conforme `barra-de-navegacao.md` e [ADR 0011](../../docs/adr/0011-navegacao-tres-destinos.md).
- `src/view/components/TextField.tsx` (novo, extraído de `campo-de-texto.md`): substitui os
  `TextInput` inline em `signIn.tsx`/`signUp.tsx`/`forgotPassword.tsx`, com estado de foco/erro.
- `src/view/components/FilledButton.tsx` (novo, extraído de `botao.md`): botão em pílula para a
  ação principal de cada tela (FR-004).
- `src/view/components/Avatar.tsx` (novo, extraído de `avatar.md`): círculo com foto ou iniciais
  sobre `primary-container`, usado no perfil próprio (64 px) e em listas/perfil público (40 px).
- `src/view/components/SearchField.tsx` (novo, extraído de `campo-de-busca.md`): campo de busca
  em pílula com botão Limpar.

## View (telas)

- `src/view/auth/signIn.tsx`, `src/view/auth/signUp.tsx`: redesenhar usando `TextField` e
  `FilledButton`, sem mudar a lógica de submissão já existente.
- `src/view/auth/forgotPassword.tsx` (novo): formulário de e-mail, exibe a senha temporária
  retornada, com link de volta ao login.
- `src/view/home.tsx`: trocar o `renderItem` manual pelo componente de item de lista do design
  system (linha-de-livro.md), mantendo o comportamento (tag de modalidade, estados) já coberto
  pela spec 005; adicionar `NavigationBar`.
- `src/view/search/search.tsx` (novo): `SearchField` + lista filtrada, estado vazio conforme
  `estado-vazio.md`.
- `src/view/profile/profile.tsx` (novo): `Avatar` de 64 px + campos editáveis (`TextField`) +
  `FilledButton` "Salvar".
- `src/view/profile/userProfile.tsx` (novo): `Avatar` de 40 px + nome público + lista de
  anúncios da pessoa (reaproveitando o item de lista do catálogo).

## Rotas (`src/app/`)

- `src/app/esqueci-senha.tsx` (novo), link a partir de `signIn.tsx`.
- `src/app/pesquisa.tsx` (novo).
- `src/app/perfil.tsx` (novo).
- `src/app/usuario/[id].tsx` (novo, rota dinâmica).
- `src/app/_layout.tsx`: compor a `NavigationBar` nas rotas de nível superior (Início, Pesquisa,
  Perfil), sem alterar as rotas de fluxo (entrar, criar-conta, anunciar, esqueci-senha, pedidos).

## Testes

Seguir o mesmo padrão já usado nas specs 003/004/005: unitários para validação/casos de uso
novos (`requestPasswordReset`, `updateProfile`, filtro de busca), hooks para os ViewModels
novos, componentes para as telas novas, e um teste de integração por critério de sucesso
(SC-001 a SC-003), em `tests/integration/`.
