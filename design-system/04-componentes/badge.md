# Badge

Origem no sistema base: Material 3, Badge. Situação: **Herdado**.

## Quando usar

- Indicar novidade sobre um ícone de navegação (ex. mensagens não lidas em Conversas).

## Quando não usar

- Como única forma de comunicar a contagem — o número também entra no rótulo acessível do
  destino (ver [Barra de navegação](barra-de-navegacao.md)).

## Anatomia

1. Ponto ou número sobre o canto do ícone (token `error`/`on-error`)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Ponto (sem `count`) | Novidade sem contagem exata | `error`, 8 px |
| Numérico (com `count`) | Contagem exata, até "99+" | `error`/`on-error` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Visível | `error` com `on-error` | Puramente decorativo | O número entra no rótulo do destino, não é lido isolado |
| Ausente | Não renderizado | - | - |

## Acessibilidade

- Badge é decorativo (`accessibilityElementsHidden` / `importantForAccessibility="no"` no React
  Native); o número só é anunciado como parte do rótulo do item que ele decora.
- Contraste `on-error` sobre `error` ≥ 4,5:1.

## Faça e evite

- **Faça:** truncar em "99+" acima de 99.
- **Evite:** deixar o badge como única fonte da contagem — sempre repita no rótulo acessível.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function Badge({ count }: { count?: number }) {
  if (count === undefined) {
    return <View style={{ width: 8, height: 8, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.error }} />;
  }
  return (
    <View style={{ minWidth: 16, height: 16, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
      <Text style={{ color: "#ffffff", fontSize: 10 }}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}
```
