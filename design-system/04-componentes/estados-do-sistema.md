# Estados do Sistema (Loading / Sem conexão / Erro)

> [!NOTE]
> **IMPLEMENTADO (Issue #76, Spec 021)**: Implementado e ativo em `src/view/components/LoadingState.tsx`,
> `OfflineState.tsx` e `ErrorState.tsx`, com detecção de conectividade via
> `src/viewmodel/useNetworkStatus.ts`.

Origem no sistema base: Material 3 (indicadores de progresso, banners de erro). Situação: **Novo**
(fluxo 10 · Estados do sistema no Figma: `10.01 · Explorar carregando`, `10.02 · Sem conexão`,
`10.03 · Erro ao carregar`).

## Quando usar

- `LoadingState`: enquanto uma lista busca dados de um datasource e ainda não há resposta.
- `OfflineState`: quando o app detecta perda de conectividade de rede durante o uso.
- `ErrorState`: quando uma chamada a datasource falha por outro motivo (erro do servidor, dado
  inválido) e a pessoa precisa de uma ação explícita para tentar de novo.

## Quando não usar

- Para o resultado de uma busca sem itens (não é erro, é uma lista vazia válida) — use
  [estado-vazio.md](estado-vazio.md).
- Para confirmar uma ação destrutiva — use [dialogo.md](dialogo.md).

## Anatomia

- **LoadingState**: indicador de progresso centralizado ou esqueleto (`LoadingSkeletonVariants.tsx`, [ADR 0103](../../docs/adr/0103-esqueletos-de-carregamento-e-cache-instantaneo.md)) + texto curto ("Carregando…").
- **ErrorState**: ícone + mensagem em cartão (`accessibilityRole="alert"`) + botão explícito ("Tentar novamente").
- **OfflineState**: cartão centralizado com ícone `wifiOff`, mensagem acessível (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`), botão explícito ("Tentar novamente") e **auto-recuperação** ao detectar o retorno da conexão ([ADR 0102](../../docs/adr/0102-design-de-erros-e-auto-recuperacao-offline.md)).

## Variantes

| Variante | Uso | Diferença |
| --- | --- | --- |
| `ErrorState` | Erro genérico (servidor, validação) | Botão preenchido (ação primária) |
| `OfflineState` | Sem conectividade de rede | Ícone de wifi cortado; auto-recupera ao reconectar e mantém botão explícito de tentativa |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Carregando | `ActivityIndicator` com `tokens.colors.action` ou Skeletons | Exibe indicador ou cache instantâneo (SWR) durante a consulta | `accessibilityLabel` descreve o que está carregando |
| Sem conexão | Ícone `wifiOff` + cartão centralizado | Dispara `onRetry` automaticamente quando `isOnline` volta a `true` e mantém botão manual | Mensagem com `accessibilityRole="alert"` e `accessibilityLiveRegion="polite"` |
| Erro | Ícone `error` + `tokens.colors.error` | Oferece "Tentar novamente"; sem loop automático de retry | Mensagem com `accessibilityRole="alert"` e `accessibilityLiveRegion="polite"` |

## Detecção de conectividade

- `src/model/datasources/iNetworkStatusDataSource.ts` define o contrato (`isOnline()` +
  `subscribe()`).
- `src/infra/datasources/netInfoNetworkStatusDataSource.ts` implementa via
  `@react-native-community/netinfo` (iOS/Android/Web). `isConnected === false` é o único caso
  tratado como offline; `null` (estado ainda não determinado) é tratado como online, conforme a
  própria documentação do NetInfo recomenda.
- `src/infra/datasources/memoryNetworkStatusDataSource.ts` sempre reporta online — usado em
  testes e no modo em memória.
- `src/viewmodel/useNetworkStatus.ts` expõe `{ isOnline }` reativo para as telas decidirem entre
  `ErrorState` e `OfflineState` quando `state.error` existir.

## Faça e evite

- **Faça:** usar `ErrorState`/`OfflineState` apenas quando `state.error` for verdadeiro, nunca
  como substituto do estado vazio de uma busca válida.
- **Faça:** manter a ação de tentar de novo sempre como um botão explícito.
- **Evite:** implementar uma nova verificação de conectividade ad hoc por tela — reaproveitar
  `useNetworkStatus`.
- **Evite:** tentar operar em modo offline de verdade (cache local, fila de ações pendentes) —
  fora do escopo desta spec; o componente só avisa.

## Código

```tsx
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { LoadingState } from "@/view/components/LoadingState";
import { ErrorState } from "@/view/components/ErrorState";
import { OfflineState } from "@/view/components/OfflineState";

function ExploreList({ state, onRetry }: { state: { loading: boolean; error: string | null }; onRetry: () => void }) {
  const { isOnline } = useNetworkStatus();
  if (state.loading) return <LoadingState label="Carregando livros" />;
  if (state.error) {
    return isOnline ? <ErrorState message={state.error} onRetry={onRetry} /> : <OfflineState onRetry={onRetry} />;
  }
  return null;
}
```
