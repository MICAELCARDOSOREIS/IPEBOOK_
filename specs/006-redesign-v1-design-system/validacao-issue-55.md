# Validação: Issue #55 — Perfil próprio e perfil público (Spec 006, parte Maria Clara)

Data: 2026-10-20.

Esta validação cobre apenas as tarefas atribuídas à Issue #55 (T001-parte, T004, T006, T009,
T013, T014, T020, T021, T024 — ver `tasks.md`). As demais tarefas da Spec 006 pertencem às
Issues #54 (Micael, já fechada), #56 e #59 (Maria Clara/Micael, ainda em aberto) e **não** fazem
parte desta entrega; T025 (validação final conjunta) só poderá ser marcada quando todas elas
estiverem concluídas.

## O que foi implementado

- **Decisão de escopo (T001/T004/T006)**: em vez de estender `User`/`IAuthDataSource`/
  `IAuthUseCases` (como o plano original previa, antes de existir a Spec 018), os campos
  editáveis do perfil foram adicionados à store de perfil já criada na Spec 018/Issue #73
  (`IProfileDataSource`/`PublicProfileUseCases`), evitando duplicar conceitos e tocar nos
  arquivos de autenticação.
  - `src/model/datasources/iProfileDataSource.ts`: `StoredProfile.photoUrl?`,
    `StoredProfile.socialHandle?`, método `update(userId, patch)`.
  - `src/infra/datasources/memoryProfileDataSource.ts` e `supabaseProfileDataSource.ts`:
    implementam `update`.
  - `src/model/entities/publicProfile.ts`: `PublicProfile.photoUrl?`, `.socialHandle?`, novo tipo
    `ProfileEdits`.
  - `src/usecase/publicProfileUseCases.ts`: `updateProfile(userId, edits)` — valida nome
    obrigatório (≤ 60 caracteres), foto como link http(s) e rede social (≤ 60 caracteres).
  - Migração `supabase/migrations/202610200005_edicao_perfil_proprio.sql`: colunas
    `photo_url`, `social_handle` em `v2_profiles` (RLS de update já existente desde a Spec 018
    cobre a edição do próprio perfil).
- **T009**: `src/view/components/Avatar.tsx` (avatar.md) — foto ou iniciais, tamanhos 40/64.
- **T013**: `src/viewmodel/useProfileViewModel.ts` (novo) — carrega e atualiza o perfil da
  pessoa autenticada.
- **T014 (superseded)**: o ViewModel do perfil público já existe desde a Spec 018
  (`usePublicProfileViewModel.ts`); não foi criado um segundo, duplicado.
- **T020**: `src/view/profile/profile.tsx` + rota `src/app/perfil.tsx` — exige sessão
  (redireciona para `/entrar` sem uma); edição de nome, foto (link) e rede social; confirmação
  "Perfil atualizado" (Snackbar).
- **T021 (superseded)**: o perfil público já existe desde a Spec 018
  (`src/view/listings/publicProfile.tsx` + rota `src/app/perfil/[userId].tsx`, não
  `usuario/[id].tsx` como o plano original previa); estendido nesta entrega com `Avatar` e
  exibição da rede social. E-mail nunca é exposto (FR-007 preservado).
- **T022**: `NavigationBar` em `src/app/_layout.tsx` já estava composta; removida a restrição
  `disabledDestinations={["profile"]}` agora que `/perfil` existe.
- **T024**: `tests/integration/sc006BuscaEPerfilIntegration.test.ts` — cobre SC-003 (edição de
  perfil) pelas camadas reais (container → caso de uso → infra em memória). SC-002 (busca) é
  escopo da Issue #56, não desta entrega.

## Validação executada

- `npm run typecheck`: limpo.
- `npm run check:architecture`: 199 arquivos verificados, sem violações de camada.
- `npm run test:sql`: migrações aplicadas com sucesso (PGlite), incluindo a nova coluna de
  `v2_profiles`; cenários de RLS existentes continuam passando.
- `npm run test:coverage`: **707 testes passando em 106 arquivos** (após sincronizar com
  `develop`, que avançou com `signUp` passando a exigir nome), cobertura acima de 80% nas 4
  dimensões (Statements 89,61%, Branches 81,24%, Functions 86,49%, Lines 91,04%).
- `npm run build:web`: build da Web concluído, incluindo a nova rota `/perfil`.

## Testes novos

- `tests/unit/memoryProfileDataSource.test.ts`, `tests/unit/supabaseProfileDataSource.test.ts`:
  `update`, incluindo os caminhos de erro.
- `tests/unit/publicProfileUseCases.test.ts`: casos novos de `updateProfile` (validação de
  nome, link de foto, rede social, criação implícita do perfil, limpeza de campos).
- `tests/components/avatar.test.tsx`: iniciais, foto, nome com uma palavra só.
- `tests/hooks/useProfileViewModel.test.tsx`: carregamento, atualização, erros de domínio e
  genérico, ausência de sessão.
- `tests/components-mocked/profileView.test.tsx`: redirecionamento sem sessão, preenchimento,
  salvar, confirmação, erro de carregamento.
- `tests/components-mocked/publicProfileView.test.tsx`: casos novos para rede social e avatar.
- `tests/integration/sc006BuscaEPerfilIntegration.test.ts`: fluxo real de edição de perfil
  (SC-003).

## Limitações e pendências

- Verificação manual da tela de Perfil num dispositivo/navegador real não foi feita nesta
  sessão — sem acesso a dispositivo físico, emulador ou navegador neste ambiente.
- Upload real de foto não foi implementado — por decisão de escopo do próprio plano, o campo
  aceita somente um link (URL) de imagem.
- T025 (validação final da Spec 006) permanece em aberto até #56 e #59 serem concluídas.
