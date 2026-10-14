# Validação: Autenticação e Cadastro de Anúncio

Data: 2026-10-14. Branch: `feature/29-container-home-integracao` (base `develop`, commit `38c6b6a`).
Status: Implementado e validado localmente com sucesso. Trabalho dividido entre Maria Clara
Almeida Martins (autenticação) e Antonio Carlos Gomes (modelo e cadastro de anúncio); esta etapa
final (container, Home, integração, documentação) foi concluída pela Maria Clara.

## Evidências Executáveis

### 1. `npm run validate` (código de saída 0)

1. `tsc --noEmit`: zero erros de tipagem.
2. `node scripts/verificar-arquitetura.mjs`: 34 arquivos verificados em `src/`, zero violações
   de importação entre camadas.
3. `npm run test:coverage`: 107/107 testes aprovados em 19 arquivos.

### 2. Relatório de Cobertura de Código (v8)

* **Statements:** 96,28% (meta mínima: 80%)
* **Branches:** 86,98% (meta mínima: 80%)
* **Functions:** 97,50% (meta mínima: 80%)
* **Lines:** 97,53% (meta mínima: 80%)

### 3. Testes relevantes a esta spec

* `tests/unit/authValidator.test.ts`, `tests/unit/authUseCases.test.ts`: validação de e-mail/senha
  (FR-001), duplicidade de e-mail (FR-002), credenciais inválidas sem revelar existência de conta.
* `tests/unit/bookValidator.test.ts` (estendido por Antonio): validação condicional de preço por
  modalidade (FR-005).
* `tests/hooks/useAuthViewModel.test.tsx`, `tests/hooks/useCreateListingViewModel.test.tsx`:
  estado de sessão e de formulário de anúncio, sucesso e erro.
* `tests/components/authViews.test.tsx`, `tests/components/createListingView.test.tsx`: telas de
  entrar/criar conta/anunciar com RNTL (carregamento, erro, sucesso, acessibilidade).
* `tests/components-mocked/homeSessionIndicator.test.tsx`: indicador de sessão e botão "Anunciar"
  condicional na Home.
* `tests/components-mocked/createListingScreen.test.tsx`: gate de sessão da rota de anúncio —
  redireciona para entrar sem sessão (FR-006), renderiza o formulário com sessão real.
* `tests/integration/authIntegration.test.tsx`: autenticação pelas camadas reais.
* `tests/integration/sc001Integration.test.ts`: **SC-001 completo** — criar conta → entrar →
  cadastrar anúncio de venda, troca e doação → ver os três na listagem, pelas camadas reais
  (`AuthUseCases`/`MemoryAuthDataSource` + `BookUseCases`/`MemoryBookDataSource`); cobre também
  o bloqueio de cadastro sem sessão (FR-006) e a exigência de preço na venda (FR-005).

### 4. Bug encontrado e corrigido durante esta validação

`src/app/anunciar.tsx` (issue #28) passava `sessionUserId={null}` fixo para `CreateListing`,
então `createListing` sempre lançava `AuthError` ("Sessão obrigatória"), mesmo com o usuário
autenticado — o cadastro de anúncio nunca funcionava de ponta a ponta. Corrigido criando
`src/view/listings/createListingScreen.tsx`, que lê a sessão real via `useAuthViewModel` e só
renderiza o formulário quando há usuário autenticado, redirecionando para `/entrar` caso
contrário. A rota `app/anunciar.tsx` não pode importar `useAuthViewModel` diretamente (regra de
camadas: `app` só importa `view`), por isso o gate ficou na camada de View.

## Critérios de sucesso da spec (spec.md)

* **SC-001**: coberto por `tests/integration/sc001Integration.test.ts` (automatizado) — validação
  manual em dispositivo físico não realizada, fora do escopo desta etapa (ver `docs/produto.md`).
* **SC-002**: mensagens de erro de cada cenário de falha verificadas por teste automatizado (ver
  testes unitários e de integração listados acima).
* **SC-003**: `npm run validate` passa sem regressão nos requisitos RF01–RF07 da fundação.

## Alinhamento com a Norma ISO/IEC 25010

* **Adequação Funcional:** criar conta, entrar, sair, cadastrar anúncio em cada modalidade e
  listá-los, cobertos por testes unitários e de integração reais.
* **Confiabilidade:** sessão expirada/ausente tratada (redirecionamento), erros de domínio
  convertidos em mensagens seguras, estado de concorrência da listagem preservado.
* **Usabilidade / Acessibilidade:** estados de carregamento, erro e sucesso explícitos nas telas
  de autenticação e cadastro; rótulos de acessibilidade testados com RNTL.

## Limitações registradas

* Validação em dispositivo Android físico não realizada (fora do escopo desta spec).
* Persistência em memória: dados desaparecem ao encerrar a execução; aceitável conforme
  `spec.md` ("Casos de erro e suposições").
* Login com Google, verificação de e-mail, edição/exclusão de anúncio e upload de foto
  permanecem fora do escopo (ver `spec.md`, "Fora do escopo").
