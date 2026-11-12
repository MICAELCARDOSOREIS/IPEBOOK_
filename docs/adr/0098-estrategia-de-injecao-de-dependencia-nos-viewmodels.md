# 0098. Estratégia de injeção de dependência nos ViewModels

- **Status:** Aceito
- **Data:** 2026-11-05
- **Contexto:** Arquitetura MVVM / Injeção de dependência / Testabilidade

## Contexto

A constituição (`.specify/memory/constitution.md`, princípio 2) define o fluxo *rotas → Views →
ViewModels → casos de uso → contratos do domínio*, com `src/di/container.ts` compondo as
dependências. Na prática, 50 dos 61 arquivos de `src/viewmodel/` importam instâncias prontas de
`@/di/container` (ex.: `src/viewmodel/useSearchAlertsViewModel.ts:2`), e 9 deles não expõem nenhum
parâmetro de dependência (`useNetworkStatus.ts`, `usePwaViewModel.ts`,
`useNegotiationRatingViewModel.ts`, `useNegotiationChatViewModel.ts`, `useConversationsViewModel.ts`,
`useChatWithUser.ts`, `useProfileSafetyViewModel.ts`, `useNavigationBadgesViewModel.ts`,
`errorReporting.ts`). O efeito colateral é visível nos testes: não existe um único `vi.mock("@/di/container")` na suíte, mas
53 arquivos substituem o **próprio ViewModel** por mock (120 ocorrências de
`vi.mock("@/viewmodel/useAuthViewModel")` e afins) para conseguir exercitar a View — o
acoplamento empurra a substituição um nível acima, e o contrato do ViewModel fica sem teste.

Nada disso é defeito visível ao usuário; é dívida de manutenibilidade, registrada na Spec 126 (E1).

## Decisão

1. **Parâmetro obrigatório no ViewModel, composição no container.** O ViewModel passa a receber suas
   dependências por parâmetro obrigatório, tipado pelo contrato de `src/model`, e deixa de importar
   `@/di/container`. O padrão já existente em 41 deles (`useSearchAlertsViewModel(userId, initialQuery, useCases)`)
   é o modelo; a diferença é remover o default que aponta para o singleton.
2. **Fábricas de ViewModel no container.** `src/di/container.ts` passa a exportar, por fluxo, uma
   fábrica (`makeSearchAlertsViewModel(userId, initialQuery)`), que monta o ViewModel com as
   dependências compostas. A View chama a fábrica; nenhum arquivo de `src/viewmodel/` conhece o
   container. Isso mantém o container como único ponto de composição, como exige a constituição.
3. **Regra executável com catraca.** A matriz de camadas em `scripts/verificar-arquitetura.mjs` hoje
   permite explicitamente `viewmodel → di`; essa aresta sai da matriz. `scripts/verificar-arquitetura.mjs`
   passa a reprovar import de `@/di` em `src/viewmodel/**`. A migração é em lotes por fluxo (catálogo,
   pedidos, conversas, perfil, notificações), então a regra aceita uma **lista de exceções
   decrescente**: falha se a lista crescer ou se um arquivo da lista violar sem estar listado.
4. **Os 9 sem parâmetro entram no mesmo regime.** Onde hoje se usa `networkStatusDataSource`,
   `pwaService`, `storeReviewService`, `errorReporter` ou casos de uso compostos, o contrato vira
   parâmetro e a composição vai para a fábrica. Serviços de efeito colateral (relato de erro,
   status de rede) continuam com contrato único, sem singleton global acessível da View.
5. **Migração sem mudança de comportamento.** Nenhuma tela, texto, rota ou regra de negócio muda
   neste trabalho; cada lote termina com a suíte completa verde e os mesmos números de testes de
   comportamento.

## Consequências

- **Positivas:** o ViewModel volta a ser testável por injeção real (o caso de teste substitui o
  contrato em vez de mockar o módulo), a fronteira de camadas fica verificável por script e o
  acoplamento com implementações de `src/infra/` permanece confinado ao container e aos testes,
  como já vale hoje para `src/infra/`.
- **Negativas e mitigações:** cada View passa a depender de uma fábrica nova (boilerplate em ~50
  arquivos); mitiga-se gerando a fábrica junto com a migração do lote, sem reescrever a View além da
  linha de criação do ViewModel. Remover um default esquecido em alguma chamada quebra em tempo de
  execução; mitiga-se por tipos (`npm run typecheck`), pela regra do item 3 e pela suíte completa a
  cada lote. A fábrica no container é um segundo registro a manter; mitiga-se mantendo-a ao lado da
  composição existente, sem criar contêiner paralelo.
- **Fora desta decisão:** extração das telas acima de 900 linhas (E2) e a política sobre o mock de
  runtime em `tests/mocks/react-native.ts` (E3), ambas na Spec 126 e tratadas em ADRs próprios quando
  houver escolha de infraestrutura de teste.

## Vínculos

- Spec: `specs/126-dividas-estruturais-injecao-tamanho-de-telas-e-runtime-de-teste/spec.md` (E1, CA1, CA2, CA3)
- Tarefas: `specs/126-dividas-estruturais-injecao-tamanho-de-telas-e-runtime-de-teste/tasks.md` (Fases 1 e 2)
- Constituição: princípio 2 (fluxo de camadas e composição em `di/container.ts`)
- Verificação: `npm run check:architecture` (`scripts/verificar-arquitetura.mjs`)
