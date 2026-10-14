# Tarefas: v1.0 — telas alinhadas ao design system

Status: **especificada, implementação não iniciada**. Dividida em 4 issues independentes:
[#54](https://github.com/Ghostyxseven/IPEBOOK_/issues/54) (Micael — autenticação: T001 parte,
T002, T003, T005, T007, T008, T012, T016, T017, T023), [#55](https://github.com/Ghostyxseven/IPEBOOK_/issues/55)
(Maria Clara — perfil, toca os mesmos arquivos de auth do Micael: T001 parte, T004, T006, T009,
T013, T014, T020, T021, T024), [#56](https://github.com/Ghostyxseven/IPEBOOK_/issues/56) (Maria
Clara — home/navegação/pesquisa/detalhe do livro, sem dependência de arquivo com #54: T010,
T011, T015, T018, T019, T022, T029, T030, T031) e [#59](https://github.com/Ghostyxseven/IPEBOOK_/issues/59)
(Micael — modelo/caso de uso do detalhe do livro: T028). T025-T027 (validação, documentação,
registro final) são conjuntas.

## Modelo e validação

- [ ] T001 Estender `src/model/entities/user.ts` com `publicName?`, `photoUrl?`, `socialHandle?`
      (**Maria Clara**, US4) e reaproveitar `authValidator.ts` para a senha temporária
      (**Micael**, FR-002) — sem regra nova de validação.
- [ ] T002 Estender `src/model/datasources/iAuthDataSource.ts` com
      `requestPasswordReset(email): Promise<string>`. **Micael**
- [ ] T003 Implementar `requestPasswordReset` em
      `src/infra/datasources/memoryAuthDataSource.ts`, com teste unitário cobrindo e-mail
      existente e inexistente (FR-001). **Micael**
- [ ] T004 Estender `IAuthDataSource`/`memoryAuthDataSource.ts` com `updateProfile`, com teste
      unitário. **Maria Clara**

## Casos de uso

- [ ] T005 Adicionar `requestPasswordReset` a `IAuthUseCases`/`authUseCases.ts`, convertendo
      e-mail inexistente em `AuthError` com mensagem neutra (FR-001), com teste unitário.
      **Micael**
- [ ] T006 Adicionar `updateProfile` a `IAuthUseCases`/`authUseCases.ts`, com teste unitário.
      **Maria Clara**
- [ ] T028 Adicionar `getBookById(id)` a `IBookUseCases`/`bookUseCases.ts`, delegando a
      `IBookDataSource.findById` (já existe) e convertendo id inexistente em erro de domínio
      tratável (FR-009), com teste unitário. **Micael**

## Componentes reaproveitáveis do design system

- [ ] T007 `src/view/components/TextField.tsx` (campo-de-texto.md: foco, erro), com teste de
      componente. **Micael**
- [ ] T008 `src/view/components/FilledButton.tsx` (botao.md: pílula, desabilitado), com teste.
      **Micael**
- [ ] T009 `src/view/components/Avatar.tsx` (avatar.md: 40/64 px, iniciais), com teste. **Maria
      Clara**
- [ ] T010 `src/view/components/SearchField.tsx` (campo-de-busca.md), com teste. **Maria Clara**
- [ ] T011 `src/view/components/NavigationBar.tsx` (3 destinos, ADR 0011), com teste cobrindo
      item ativo/inativo. **Maria Clara**

## ViewModels

- [ ] T012 `src/viewmodel/useAuthViewModel.ts`: ação `requestPasswordReset`, com teste
      (`renderHook`). **Micael**
- [ ] T013 `src/viewmodel/useProfileViewModel.ts` (novo), com teste. **Maria Clara**
- [ ] T014 `src/viewmodel/useUserProfileViewModel.ts` (novo, filtro por `ownerId`), com teste.
      **Maria Clara**
- [ ] T015 `src/viewmodel/useSearchViewModel.ts` (novo, filtro client-side por título/autor,
      FR-005), com teste. **Maria Clara**

## Telas e rotas

- [ ] T016 Redesenhar `src/view/auth/signIn.tsx` e `src/view/auth/signUp.tsx` com
      `TextField`/`FilledButton`, sem mudar a lógica de submissão, com testes RNTL atualizados.
      **Micael**
- [ ] T017 Criar `src/view/auth/forgotPassword.tsx` + rota `src/app/esqueci-senha.tsx`, com
      testes RNTL cobrindo US1. **Micael**
- [ ] T018 Redesenhar `src/view/home.tsx` com o item de lista do design system e adicionar
      `NavigationBar`, sem regressão na spec 005, com testes atualizados. **Maria Clara**
- [ ] T019 Criar `src/view/search/search.tsx` + rota `src/app/pesquisa.tsx`, com testes RNTL
      cobrindo US3 (SC-002). **Maria Clara**
- [ ] T020 Criar `src/view/profile/profile.tsx` + rota `src/app/perfil.tsx` (exige sessão,
      FR-006), com testes RNTL cobrindo US4. **Maria Clara**
- [ ] T021 Criar `src/view/profile/userProfile.tsx` + rota dinâmica `src/app/usuario/[id].tsx`,
      com testes RNTL cobrindo US5 (sem expor e-mail, FR-007). **Maria Clara**
- [ ] T022 Compor a `NavigationBar` em `src/app/_layout.tsx` nas 3 rotas de nível superior.
      **Maria Clara**
- [ ] T029 Criar `src/view/listings/bookDetail.tsx` + rota dinâmica `src/app/livro/[id].tsx`
      (US6: título, autor, tag de modalidade, preço, link ao perfil de quem anunciou, botão
      "Solicitar negociação"), consumindo `getBookById` (T028, Micael). **Maria Clara**
- [ ] T030 Em `src/view/home.tsx` (parte de T018), trocar o botão "Solicitar negociação" da
      linha da lista por navegação para `livro/[id]` (T029) — a ação de negociar passa a viver
      só no detalhe. **Maria Clara**

## Testes de integração e validação

- [ ] T023 `tests/integration/sc006RecuperarSenhaIntegration.test.ts` (SC-001, pelas camadas
      reais). **Micael**
- [ ] T024 `tests/integration/sc006BuscaEPerfilIntegration.test.ts` (SC-002/SC-003, pelas
      camadas reais). **Maria Clara**
- [ ] T025 Rodar `npm run validate` completo (typecheck, arquitetura, cobertura ≥ 80%, sem
      regressão nas specs 003/004/005) e registrar evidências em `validacao.md`. **Conjunta**
- [ ] T031 `tests/integration/sc006DetalheLivroIntegration.test.tsx` (SC-005, pelas camadas
      reais — depende de T028, Micael). **Maria Clara**

## Documentação e registro final

- [ ] T026 Atualizar `docs/arquitetura.md`, `docs/produto.md` e `docs/estado.md` com o estado
      final desta versão. **Conjunta**
- [ ] T027 **Último passo, só depois de T001-T026 concluídas e validadas em dispositivo físico**
      (mesmo processo da conferência do MVP, ver `docs/versoes/mvp/resumo.md`): criar
      `docs/versoes/1.0/resumo.md` e `docs/versoes/1.0/imagens/` com capturas de cada tela nova
      ou redesenhada, documentando o que foi observado — não presumir aprovação nem publicação
      só por existir o registro. **Conjunta**
