# Tarefas: Autenticação e Cadastro de Anúncio

Status: **concluída**. Atribuição final: **Maria Clara Almeida Martins** — autenticação
(T001/T002 parte, T003, T004, T006, T009, T011, T014 rotas de entrar/criar-conta); **Antonio
Carlos Gomes** — modelo e cadastro do anúncio (T001/T002 parte, T005, T006... T007, T010, T012,
T014 rota de anunciar). T008, T013, T015, T016 e T017 eram conjuntas.

## Modelo e validação

- [x] T001 Criar `src/model/entities/user.ts` (**Maria Clara**) e estender
      `src/model/entities/book.ts` com `modality`, `price` opcional e `ownerId` (FR-004, FR-005)
      (**Antonio**, issue #26, PR #37).
- [x] T002 Criar `src/model/validators/authValidator.ts` (e-mail e senha) (**Maria Clara**) e
      estender `src/model/validators/bookValidator.ts` com a regra condicional de preço por
      modalidade, com testes unitários (**Antonio**, issue #26, PR #37).
- [x] T003 Criar `src/model/datasources/iAuthDataSource.ts`. **Maria Clara**

## Casos de uso e infraestrutura

- [x] T004 Criar `src/usecase/authUseCases.ts` (`IAuthUseCases`: signUp, signIn, signOut,
      getSession) com testes unitários cobrindo duplicidade de e-mail (FR-002) e credenciais
      inválidas. **Maria Clara**
- [x] T005 Estender `src/usecase/bookUseCases.ts` com `createListing`, exigindo sessão (FR-006),
      com testes unitários. **Antonio**, issue #27, PR #41.
- [x] T006 Criar `src/infra/datasources/memoryAuthDataSource.ts` com testes. **Maria Clara**
- [x] T007 Estender `src/infra/datasources/memoryBookDataSource.ts` para aceitar criação de
      anúncio, com testes. **Antonio**, issue #27, PR #41.
- [x] T008 Atualizar `src/di/container.ts` para compor `IAuthUseCases` junto ao `IBookUseCases`.
      **Maria Clara**, 2026-10-14.

## ViewModel e View

- [x] T009 Criar `src/viewmodel/useAuthViewModel.ts` com testes (`renderHook`), cobrindo sucesso
      e erro de criar conta/entrar/sair. **Maria Clara**
- [x] T010 Criar `src/viewmodel/useCreateListingViewModel.ts` com testes, cobrindo validação de
      preço por modalidade e exigência de sessão. **Antonio**, issue #28, PR #42.
- [x] T011 Criar telas `src/view/auth/signIn.tsx` e `src/view/auth/signUp.tsx` com testes RNTL
      (estados de carregamento, erro e sucesso, rótulos de acessibilidade). **Maria Clara**
- [x] T012 Criar tela `src/view/listings/createListing.tsx` com testes RNTL, incluindo o campo
      de preço condicional à modalidade. **Antonio**, issue #28, PR #42.
- [x] T013 Atualizar `src/view/home.tsx` com indicador de sessão e botão "Anunciar" condicional,
      com testes RNTL. **Conjunta** — indicador de sessão (Maria Clara) e botão "Anunciar"
      (Maria Clara, 2026-10-14, concluindo a parte que cabia à coordenação com o Antonio) feitos
      com testes em `tests/components-mocked/homeSessionIndicator.test.tsx`.
- [x] T014 Criar rotas `src/app/entrar.tsx`, `src/app/criar-conta.tsx` (**Maria Clara**),
      `src/app/anunciar.tsx` (**Antonio**, issue #28; corrigido por **Maria Clara** em
      2026-10-14 — a rota passava `sessionUserId={null}` fixo, então o cadastro sempre falhava;
      agora usa `src/view/listings/createListingScreen.tsx` como gate de sessão real).

## Integração e fechamento

- [x] T015 Criar teste de integração cobrindo o fluxo completo (SC-001): criar conta → entrar →
      cadastrar anúncio de cada modalidade → ver na listagem. **Maria Clara**, 2026-10-14 —
      `tests/integration/sc001Integration.test.ts`.
- [x] T016 Atualizar `docs/arquitetura.md`, `docs/produto.md` (tabela "Escopo e situação") e
      `docs/estado.md` refletindo a jornada completa. **Maria Clara**, 2026-10-14.
- [x] T017 Executar `npm run validate` e registrar evidências em
      `specs/003-autenticacao-e-cadastro-de-anuncio/validacao.md`. **Maria Clara**, 2026-10-14.
