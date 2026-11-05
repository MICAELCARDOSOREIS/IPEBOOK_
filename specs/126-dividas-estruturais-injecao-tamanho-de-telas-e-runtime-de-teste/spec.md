# Dívidas estruturais: injeção de dependência, tamanho de telas e runtime de teste

**Branch:** ainda não aberta (esta spec só registra requisito; plano e ADRs vêm antes da implementação)
**Estado:** Especificada em 2026-11-05 — não iniciada

## Objetivo e escopo

As três pendências registradas na análise integral de 2026-11-05 (`docs/estado.md`, entrada
"Correções da análise integral de 2026-11-05") ficaram fora das correções pontuais porque cada uma
mexe em um contrato de arquitetura, e não em um defeito de tela. Esta spec define o que precisa
ser verdade para considerá-las resolvidas. Nenhuma delas altera comportamento visível ao usuário de
Piripiri: o resultado esperado é a mesma aplicação, com imports desacoplados, telas menores de
manter e testes que não dependam de um runtime inventado.

| # | Situação hoje (evidência conferida no repositório em 2026-11-05) | Resultado esperado |
| --- | --- | --- |
| E1 | Acoplamento direto ao contêiner: 50 dos 61 arquivos de `src/viewmodel/` importam casos de uso de `@/di/container` (ex.: `src/viewmodel/useSearchAlertsViewModel.ts:2`). Das 50, 41 já aceitam o contrato por parâmetro com default (o padrão de `useSearchAlertsViewModel(userId, initialQuery, useCases)`) e 9 não expõem parâmetro nenhum — `useNetworkStatus.ts`, `usePwaViewModel.ts`, `useNegotiationRatingViewModel.ts`, `useNegotiationChatViewModel.ts`, `useConversationsViewModel.ts`, `useChatWithUser.ts`, `useProfileSafetyViewModel.ts`, `useNavigationBadgesViewModel.ts` e `errorReporting.ts` —, então o único modo de substituir a implementação em teste é mockar o módulo inteiro. | O ViewModel recebe suas dependências por parâmetro e nenhum arquivo de `src/viewmodel/` importa `@/di/container`. A composição acontece em um único lugar (`src/di/container.ts`), como já exige `npm run check:architecture` para `src/infra/`. |
| E2 | Cinco telas passam de 900 linhas: `src/view/home.tsx` (1.381), `src/view/profile/profileHub.tsx` (1.107), `src/view/listings/bookDetail.tsx` (1.104), `src/view/requests/scheduleMeeting.tsx` (1.063) e `src/view/conversations/chat.tsx` (900). Cada uma concentra seções, estilos e estados que hoje só podem ser testados renderizando a tela inteira. | Cada seção de tela vira componente próprio, com teste próprio, e nenhuma tela do `src/view/` passa do teto definido no plano. O teto é verificado por script, não por revisão de olho. |
| E3 | `tests/mocks/react-native.ts` (298 linhas) emula `View`, `Text`, `FlatList` e companhia. O mock preserva a árvore e os estilos, mas não calcula layout: asserções de largura, quebra de linha e sobreposição passam sem nenhum motor de layout real — e `screen.getByRole(...).parent!` depende de uma estrutura que só existe no mock. | As asserções de apresentação dependem apenas de contratos públicos (papel, rótulo, `testID`, estilo declarado) e o limite do mock está documentado e vigiado: nada que só o mock aprova é tratado como validação de layout. |

Fora do escopo: qualquer mudança de regra de negócio, de esquema do Supabase ou de identidade
visual; substituir o Vitest por outra suíte; migrar para `@testing-library/react-native` com
expo-router completo (peso desproporcional para o resultado); publicar, promover para `main` ou
alterar proteções remotas.

## Critérios de aceite

1. **CA1 (E1):** `grep -r "from \"@/di" src/viewmodel` não retorna nenhum arquivo. Verificação: regra
   nova em `scripts/verificar-arquitetura.mjs` reprova a importação do contêiner fora da composição,
   com mensagem apontando arquivo e linha; a regra falha contra a versão atual (50 ocorrências) e
   passa ao final.
2. **CA2 (E1):** os 9 ViewModels que hoje não expõem parâmetro de dependência passam a recebê-la, com
   o default apontando para a fábrica do contêiner, no mesmo estilo já usado em
   `useSearchAlertsViewModel(userId, initialQuery, useCases)`. Verificação: para cada um dos 9, ao
   menos um teste exercita falha de datasource e sucesso sem mockar módulo (`vi.mock` do
   contêiner deixa de ser necessário nesse ViewModel).
3. **CA3 (E1):** o comportamento de injeção fica registrado em ADR novo (opções consideradas: parâmetro
   com default, factory explícita no container e contexto React), com consequências para testes.
   ADR obrigatório antes do primeiro ViewModel migrado, conforme `AGENTS.md`.
4. **CA4 (E2):** o teto de linhas por arquivo de tela é definido no plano e aplicado por script com
   efeito de catraca: a verificação falha para arquivo acima do teto e também para a lista de
   exceções crescendo. Verificação: o script falha contra o estado atual (cinco arquivos acima do
   teto) e passa com as cinco telas refactoradas; `npm run validate` continua verde sem alterar
   nenhum texto visível ao usuário.
5. **CA5 (E2):** cada seção extraída de tela ganha teste de componente próprio (estado carregando,
   erro, vazio e sucesso, quando a seção os tiver), reutilizando os componentes de sistema já
   padronizados pela Spec 125 em vez de markup próprio.
6. **CA6 (E3):** nenhuma asserção de teste depende de `.parent!` (5 ocorrências hoje, em
   `tests/components/createListingView.test.tsx`, `tests/components/favoritesAlertsView.test.tsx` e
   `tests/components/stepProgress.test.tsx`) nem da forma que o mock dá a um componente nativo.
   Verificação: varredura em `scripts/` (ou etapa do `check:architecture`) lista os usos de
   `.parent!` em `tests/components*` e reprova quando o total sobe; cada caso removido passa a
   expressar a expectativa por contrato público (papel acessível, rótulo, `testID`, estilo declarado).
7. **CA7 (E3):** os limites de validação de layout ficam escritos em `docs/estado.md` e no README de
   testes, com o que foi conferido por teste automatizado e o que depende de conferência em
   dispositivo — sem afirmar que layout foi validado onde não foi.

## Comportamento esperado na transição

E1 e E2 são mudanças de estrutura com risco de regressão silenciosa; cada entrega deve ser
pequena e reversível:

- Migrar ViewModels em lotes (por fluxo: catálogo, pedidos, conversas, perfil), com `npm run
  check:architecture` e a suíte completa após cada lote, nunca todos de uma vez.
- Extrair seções de tela uma por vez, mantendo o arquivo antigo importando o componente extraído,
  de modo que a rota `src/app/` não mude em nenhum passo.
- E3 depende de um spike antes do compromisso: confirmar com uma tela piloto se a asserção de
  layout sobrevive à troca do mock; o resultado do spike decide se continua no mock com regras
  vigiadas ou se adota runtime adicional, e isso vai para o ADR.

## Riscos e limitações

- Risco principal: ao remover o default do contêiner em um ViewModel, chamadas esquecidas quebram em
  tempo de execução. Mitigação: tipos (`tsc`), `check:architecture` nova e suíte de componentes.
- Retirar `.parent!` dos testes pode expor expectativas que nunca estiveram certas; isso é achado,
  não regressão, e deve ser tratado um a um com evidência.
- Nada nesta spec valida layout real em navegador ou aparelho: a restrição de não usar Playwright
  permanece (`AGENTS.md`), então a conferência visual continua manual e proporcional à entrega.
- E2 não tem prazo: é melhoria de manutenibilidade e só entra na fila quando não houver defeito de
  usuário aberto no mesmo arquivo.
