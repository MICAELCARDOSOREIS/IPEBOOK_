# Tarefas: v1.0 — telas alinhadas ao design system

Status: **especificada, implementação não iniciada**. Dividida em 4 issues independentes:
[#54](https://github.com/Ghostyxseven/IPEBOOK_/issues/54) (Micael — autenticação: T001 parte,
T002, T003, T005, T007, T008, T012, T016, T017, T023), [#55](https://github.com/Ghostyxseven/IPEBOOK_/issues/55)
(Maria Clara — perfil, toca os mesmos arquivos de auth do Micael: T001 parte, T004, T006, T009,
T013, T014, T020, T021, T024), [#56](https://github.com/Ghostyxseven/IPEBOOK_/issues/56) (Maria
Clara — home/navegação/pesquisa/detalhe do livro, sem dependência de arquivo com #54: T010,
T011, T015, T018, T019, T022, T029, T030, T031, T032, T033) e [#59](https://github.com/Ghostyxseven/IPEBOOK_/issues/59)
(Micael — modelo/caso de uso do detalhe do livro: T028). T025-T027 (validação, documentação,
registro final) são conjuntas.

## Modelo e validação

- [x] T001 (parte Maria Clara, US4): decisão de escopo — em vez de estender `User`/
      `user.ts` (entidade mínima de autenticação: `id`, `email`), os campos editáveis do perfil
      (`photoUrl?`, `socialHandle?`, além do `name` já existente) foram adicionados a
      `StoredProfile`/`IProfileDataSource` (criado na Spec 018/Issue #73, que já cobre o
      perfil público). Evita tocar nos arquivos de autenticação (coordenação com #54) e reaproveita
      a store de perfil que já existe. Parte do Micael (senha temporária) não tocada. Ver
      `validacao.md` da Issue #55.
- [x] T002 Estender `src/model/datasources/iAuthDataSource.ts` com
      `requestPasswordReset(email): Promise<string>`. **Micael**
- [x] T003 Implementar `requestPasswordReset` em
      `src/infra/datasources/memoryAuthDataSource.ts`, com teste unitário cobrindo e-mail
      existente e inexistente (FR-001). **Micael**
- [x] T004 (reespecificado, ver T001): `update(userId, patch)` adicionado a
      `IProfileDataSource`/`memoryProfileDataSource.ts`/`supabaseProfileDataSource.ts` (não a
      `IAuthDataSource`, ver decisão em T001), com testes unitários (`memoryProfileDataSource.test.ts`).
      **Maria Clara**

## Casos de uso

- [x] T005 Adicionar `requestPasswordReset` a `IAuthUseCases`/`authUseCases.ts`, convertendo
      e-mail inexistente em `AuthError` com mensagem neutra (FR-001), com teste unitário.
      **Micael**
- [x] T006 (reespecificado, ver T001/T004): `updateProfile(userId, edits)` adicionado a
      `IPublicProfileUseCases`/`publicProfileUseCases.ts` (não a `IAuthUseCases`), com validação
      de nome obrigatório/tamanho, foto como link http(s) e teste unitário.
      **Maria Clara**
- [x] T028 Adicionar `getBookById(id)` a `IBookUseCases`/`bookUseCases.ts`, delegando a
      `IBookDataSource.findById` (já existe) e convertendo id inexistente em erro de domínio
      tratável (FR-009), com teste unitário. **Micael**

## Componentes reaproveitáveis do design system

- [x] T007 `src/view/components/TextField.tsx` (campo-de-texto.md: foco, erro), com teste de
      componente. **Micael**
- [x] T008 `src/view/components/FilledButton.tsx` (botao.md: pílula, desabilitado), com teste.
      **Micael**
- [x] T009 `src/view/components/Avatar.tsx` (avatar.md: 40/64 px, iniciais), com teste
      (`tests/components/avatar.test.tsx`). **Maria Clara**
- [x] T010 `src/view/components/SearchField.tsx` (campo-de-busca.md), com teste
      (`tests/components/searchField.test.tsx`). **Maria Clara**
- [x] T011 `src/view/components/NavigationBar.tsx` (3 destinos, ADR 0011), com teste cobrindo
      item ativo/inativo (`tests/components/navigationBar.test.tsx`). **Maria Clara**
- [x] T032 `src/view/components/BookCover.tsx` (capa-ilustrativa.md: cor/motivo determinísticos
      a partir do id, variantes "em lista" 44px e "em cartão" ≥80px, FR-010), com teste
      (`tests/components/bookCover.test.tsx`). **Maria Clara**
- [x] T033 `src/view/components/TopAppBar.tsx` (barra-superior.md: botão voltar + título,
      FR-011), com teste (`tests/components/topAppBar.test.tsx`). **Maria Clara**

## ViewModels

- [x] T012 `src/viewmodel/useAuthViewModel.ts`: ação `requestPasswordReset`, com teste
      (`renderHook`). **Micael**
- [x] T013 `src/viewmodel/useProfileViewModel.ts` (novo), com teste
      (`tests/hooks/useProfileViewModel.test.tsx`). **Maria Clara**
- [x] T014 (superseded pela Spec 018/Issue #73): o perfil público (filtro por `ownerId`) já é
      coberto por `usePublicProfileViewModel.ts`, criado naquela spec antes desta ser retomada;
      não foi criado um segundo ViewModel duplicado. **Maria Clara**
- [x] T015 `src/viewmodel/useSearchViewModel.ts` (novo, filtro client-side por título/autor,
      FR-005), com teste (`tests/hooks/useSearchViewModel.test.tsx`). **Maria Clara**

## Telas e rotas

- [x] T016 Redesenhar `src/view/auth/signIn.tsx` e `src/view/auth/signUp.tsx` com
      `TextField`/`FilledButton`, sem mudar a lógica de submissão, com testes RNTL atualizados.
      **Micael**
- [x] T017 Criar `src/view/auth/forgotPassword.tsx` + rota `src/app/esqueci-senha.tsx`, com
      testes RNTL cobrindo US1. **Micael**
- [x] T018 Redesenhar `src/view/home.tsx` com o item de lista do design system (incluindo
      `BookCover`, T032) e adicionar `NavigationBar`, sem regressão na spec 005, com testes
      atualizados (`tests/components/homeView.test.tsx`,
      `tests/components-mocked/homeViewMocked.test.tsx`). **Maria Clara**
- [x] T019 Criar `src/view/search/search.tsx` + rota `src/app/pesquisa.tsx`, com testes RNTL
      cobrindo US3 (SC-002) (`tests/components-mocked/searchView.test.tsx`). **Maria Clara**
- [x] T020 Criar `src/view/profile/profile.tsx` + rota `src/app/perfil.tsx` (exige sessão,
      FR-006; redireciona para `/entrar` sem sessão), com testes RNTL cobrindo US4
      (`tests/components-mocked/profileView.test.tsx`). **Maria Clara**
- [x] T021 (superseded pela Spec 018/Issue #73, ver T014): o perfil público já existe em
      `src/view/listings/publicProfile.tsx` + rota `src/app/perfil/[userId].tsx` (não
      `usuario/[id].tsx`); estendido nesta entrega com `Avatar` e `socialHandle`, sem expor
      e-mail (FR-007 preservado). **Maria Clara**
- [x] T022 `NavigationBar` já estava composta em `src/app/_layout.tsx`; removida a restrição
      `disabledDestinations={["profile"]}` agora que `/perfil` existe. **Maria Clara**
- [x] T029 Criar `src/view/listings/bookDetail.tsx` + rota dinâmica `src/app/livro/[id].tsx`
      (US6: `TopAppBar` com voltar, `BookCover` em cartão, título, autor, tag de modalidade,
      preço, link ao perfil de quem anunciou, botão "Solicitar negociação"), consumindo
      `getBookById` (T028, Micael) (`tests/components-mocked/bookDetailView.test.tsx`).
      **Maria Clara**
- [x] T030 Em `src/view/home.tsx` (parte de T018), trocar o botão "Solicitar negociação" da
      linha da lista por navegação para `livro/[id]` (T029) — a ação de negociar passa a viver
      só no detalhe. **Maria Clara**

## Testes de integração e validação

- [x] T023 `tests/integration/sc006RecuperarSenhaIntegration.test.ts` (SC-001, pelas camadas
      reais). **Micael**
- [x] T024 `tests/integration/sc006BuscaEPerfilIntegration.test.ts` (SC-003, edição de perfil) e
      `tests/integration/sc006PesquisaIntegration.test.tsx` (SC-002, filtro de busca) — ambos
      pelas camadas reais. **Maria Clara**
- [x] T025 `npm run validate` completo (typecheck, arquitetura, SQL, cobertura ≥ 80%) rodado
      nesta entrega (#56), que fecha as 4 issues da Spec 006 (#54/#55/#59 já concluídas). Ver
      `validacao-issue-56.md`. **Conjunta**
- [x] T031 `tests/integration/sc006DetalheLivroIntegration.test.tsx` (SC-005, pelas camadas
      reais — depende de T028, Micael). **Maria Clara**

## Documentação e registro final

- [ ] T026 Atualizar `docs/arquitetura.md`, `docs/produto.md` e `docs/estado.md` com o estado
      final desta versão. **Conjunta**
- [ ] T027 **Último passo, só depois de T001-T026 concluídas e validadas em dispositivo físico**
      (mesmo processo da conferência do MVP, ver `docs/versoes/mvp/resumo.md`): criar
      `docs/versoes/1.0/resumo.md` e `docs/versoes/1.0/imagens/` com capturas de cada tela nova
      ou redesenhada, documentando o que foi observado — não presumir aprovação nem publicação
      só por existir o registro. **Conjunta**
