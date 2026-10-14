# Estado e continuidade

Conferência: 2026-10-14 (base: branch `develop`, após merge do deploy web — PR #45 — e correção
do `typecheck`). Projeto: `~/IPEBOOK_`.

**Equipe ativa:** Micael Cardoso Reis e Maria Clara Almeida Martins. Eric Vinícius dos Santos
Oliveira e Antonio Carlos Gomes saíram da equipe em 2026-10-14.

## Estado verificado

- Branch ativa: `develop`.
- O `typecheck` agora gera os tipos de rota do Expo antes de executar TypeScript
  (`expo customize tsconfig.json && tsc --noEmit`, ver `package.json`). A validação passou
  também após remover temporariamente `.expo/types/router.d.ts`, confirmando que as rotas
  `/pedidos-recebidos` e `/meus-pedidos` são reconhecidas em um ambiente sem tipos prévios —
  corrige o falso-positivo de typecheck que antes exigia regenerar o cache manualmente
  (`expo start`) a cada rota nova.
- Estrutura arquitetural: MVVM sofisticado em sete camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`) verificada sem nenhuma violação pelo script de arquitetura (`check:architecture`).
- Correção em 2026-10-14: `scripts/verificar-arquitetura.mjs` usava `path.sep` para separar o
  caminho do import, mas o especificador (`@/view/home`) sempre usa `/`; em Windows isso
  gerava falso positivo em toda importação `@/...`. Corrigido para normalizar para `/` antes de
  separar.
- `npm run validate` **passa limpo**: typecheck ok, arquitetura sem violações (45 arquivos),
  144/144 testes passando em 24 arquivos.
- Cobertura de testes: 94,19% statements, 82,54% branches, 94,44% funções, 95,88% linhas — acima
  do limiar de 80% exigido.
- Build Web (`npm run build:web`): exportação estática com 8 rotas compiladas sem falhas.
  Deploy estático configurado para a Vercel (`vercel.json`, issue #7/#39 — Micael, PR #45);
  falta só conectar o repositório a um projeto Vercel para publicar de fato.
- Testes E2E mobile: 3 fluxos declarativos do Maestro configurados em `.maestro/`.
- Fundamentação formal: Norma ISO/IEC 25010 (Adequação Funcional, Confiabilidade e Usabilidade/Acessibilidade) detalhada em `docs/qualidade.md` junto com guia de defesa oral.
- Vínculos e ADRs: índice completo em [docs/adr/README.md](adr/README.md) (ADRs 0001 a 0010).

## Rastreabilidade das Entregas

1. `specs/001-estrutura-mvvm/`: Fundação arquitetural do Ipebook com validação inicial.
2. `specs/002-estrategia-testes/`: Estratégia completa de testes automatizados e qualidade ISO/IEC 25010.
3. `specs/003-autenticacao-e-cadastro-de-anuncio/`: **Completa** — primeira jornada funcional
   (criar conta/entrar, cadastrar anúncio de livro, sair) implementada e validada ponta a ponta.
   - **Autenticação (Maria Clara)**: via PR #34 — `User`, `authValidator`, `iAuthDataSource`
     (issue #23, fechada), `AuthUseCases`/`MemoryAuthDataSource` (issue #24, fechada),
     `useAuthViewModel`/telas `signIn`/`signUp`/rotas `entrar`/`criar-conta` (issue #25, fechada).
   - **Modelo e cadastro de anúncio (Antonio)**: `Book` com `modality`/`price`/`ownerId` (issue
     #26, PR #37); `createListing`/`MemoryBookDataSource.create` (issue #27, PR #41);
     `useCreateListingViewModel`/`createListing.tsx`/rota `anunciar.tsx` (issue #28, PR #42).
   - **Conjunta (issue #29)**: container já compunha `authUseCases`+`bookUseCases`; botão
     "Anunciar" condicional adicionado em `src/view/home.tsx`; corrigido bug em
     `src/app/anunciar.tsx` que passava `sessionUserId={null}` fixo (cadastro sempre falhava) —
     criado `src/view/listings/createListingScreen.tsx` como gate de sessão (redireciona para
     `/entrar` sem sessão, só então renderiza o formulário com o `sessionUserId` real); teste de
     integração completo de SC-001 em `tests/integration/sc001Integration.test.ts` (criar conta
     → entrar → cadastrar anúncio de cada modalidade → ver na listagem, pelas camadas reais).
   - Ver `specs/003-autenticacao-e-cadastro-de-anuncio/tasks.md` e `validacao.md` para o
     detalhamento e as evidências.
4. Tag de modalidade na Home (issue #39, Micael): implementada e mesclada (PR #38).
5. `specs/004-negociacao-simples/`: **Completa** — fluxo de negociação simples (solicitar e responder) implementado ponta a ponta (Antonio Carlos Gomes, Tarefa 25 / issue #21):
   - Modelo e contratos: `BookRequest`, `RequestStatus`, `Book.status` e `IBookRequestDataSource` (T001/T002, issue #30).
   - Casos de uso e infraestrutura: `BookRequestUseCases` (T003/T004) com regras de bloqueio (FR-001 a FR-003) e recusa automática de concorrentes com reserva do anúncio (FR-004/SC-002); `MemoryBookRequestDataSource` (T005); container DI atualizado com `IBookRequestUseCases` (T006).
   - ViewModels (T007/T008): `useRequestNegotiationViewModel`, `useReceivedRequestsViewModel`, `useSentRequestsViewModel`.
   - Views e rotas (T009/T010/T011): botão "Solicitar negociação" e atalhos na Home (`src/view/home.tsx`), telas `receivedRequests.tsx` e `sentRequests.tsx` com `requestListLayout.tsx`, e rotas `src/app/pedidos-recebidos.tsx` e `src/app/meus-pedidos.tsx`.
   - Teste de integração (T012): `tests/integration/sc002Integration.test.tsx` validando o cenário SC-002 pelas camadas reais.
   - Ver `specs/004-negociacao-simples/tasks.md` e `validacao.md` para o detalhamento e evidências.
6. `docs/`: Documentação consolidada em 7 guias temáticos (`README.md`, `produto.md`, `arquitetura.md`, `desenvolvimento.md`, `qualidade.md`, `uso.md`, `estado.md`), mais decisões de produto confirmadas diretamente pelo usuário em 2026-10-13 (problema/público, modalidade, conta) e ADRs 0005, 0006 e 0007.

## Próximos passos

1. ~~Criar Pull Request da branch `feature/21-negociacao-telas` para `develop`~~ — feito (PR #44,
   issue #21 fechada).
2. Publicar de fato o deploy Web: conectar o repositório a um projeto Vercel (ação externa,
   fora do alcance de automação — precisa de login/conta do responsável).
3. Revisar e integrar a correção da geração de tipos de rota no `typecheck` (ver `package.json`)
   nas próximas validações de CI.
4. Validar os fluxos em dispositivo físico; testes automatizados e build web não substituem
   essa conferência.
5. O backlog futuro (perfil de usuário, layout web dedicado, métricas de reputação, build
   Android, notificações, moderação) foi apagado em 2026-10-14 — eram anotações condicionais
   sem trabalho ativo. Especificar do zero pelo Spec Kit se/quando a necessidade de produto
   correspondente surgir de verdade.
