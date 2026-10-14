# Opção única (Radio)

Origem no sistema base: Material 3, Radio button. Situação: **Herdado**.

## Quando usar

- Escolha única entre até cinco opções numa lista curta (ex. motivo de recusa de proposta).

## Quando não usar

- Mais de cinco opções — nesse caso, usar uma lista de seleção (não especificada nesta versão
  do design-system).

## Anatomia

1. Círculo de seleção à esquerda
2. Rótulo da opção
3. Linha com altura mínima de 48 px

## Variantes

Não há variantes — um único estilo de opção.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Não selecionada | círculo vazio, borda `outline` | Toque seleciona (desseleciona as demais) | Anunciada como não selecionada |
| Selecionada | círculo preenchido em `primary` | - | Anunciada como selecionada |

## Acessibilidade

- `accessibilityRole="radio"` em cada opção, dentro de um grupo `accessibilityRole="radiogroup"`.
- Linha inteira é alvo de toque, mínimo 48 dp de altura.

## Faça e evite

- **Faça:** sempre ter uma opção pré-selecionada quando fizer sentido (ex. a mais comum).
- **Evite:** mais de cinco opções — a lista fica longa demais para leitura rápida.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function OpcaoUnica({ rotulo, selecionada, onPress }: { rotulo: string; selecionada: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: selecionada }}
      style={{ flexDirection: "row", alignItems: "center", gap: tokens.spacing[12], minHeight: 48, paddingHorizontal: tokens.spacing[16] }}
    >
      <View style={{ width: 20, height: 20, borderRadius: tokens.radius.full, borderWidth: 2, borderColor: tokens.colors.border, alignItems: "center", justifyContent: "center" }}>
        {selecionada ? <View style={{ width: 10, height: 10, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.action }} /> : null}
      </View>
      <Text style={tokens.typography.bodyLarge}>{rotulo}</Text>
    </Pressable>
  );
}
```
