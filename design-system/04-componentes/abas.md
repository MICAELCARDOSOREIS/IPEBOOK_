# Abas (Tabs)

Origem no sistema base: Material 3, Primary tabs. Situação: **Herdado**.

## Quando usar

- Alternar conteúdo dentro da mesma tela, com no máximo quatro abas de rótulo curto — ex.
  "Anúncios, Propostas, Concluídos" numa tela de negociação.

## Quando não usar

- Para navegação entre telas diferentes (use [Barra de navegação](barra-de-navegacao.md)).
- Mais de quatro categorias — nesse caso use Chip de filtro.

## Anatomia

1. Linha de rótulos curtos
2. Indicador de 3 px embaixo da aba ativa (`primary`)

## Variantes

Não há variantes — só a aba ativa muda.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Inativa | `on-surface-variant` | Toque troca o conteúdo | Anunciada como não selecionada |
| Ativa | `primary`, indicador de 3 px | - | Anunciada como selecionada |

## Acessibilidade

- `accessibilityRole="tab"` com `accessibilityState={{ selected }}` em cada aba, dentro de um
  container `accessibilityRole="tablist"`.
- Alvo de toque mínimo 48 dp de altura mesmo com rótulo curto.
- No iOS (quando entrar em escopo), usar o controle segmentado nativo, não este componente.

## Faça e evite

- **Faça:** rótulos curtos, no máximo uma palavra ou duas.
- **Evite:** mais de quatro abas — vira ilegível e não cabe em telas pequenas.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function Abas({ rotulos, ativa, onMudar }: { rotulos: string[]; ativa: number; onMudar: (i: number) => void }) {
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: "row" }}>
      {rotulos.map((rotulo, i) => (
        <Pressable
          key={rotulo}
          onPress={() => onMudar(i)}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === ativa }}
          style={{ flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderBottomWidth: i === ativa ? 3 : 0, borderBottomColor: tokens.colors.action }}
        >
          <Text style={{ color: i === ativa ? tokens.colors.action : tokens.colors.secondaryText, ...tokens.typography.labelMedium }}>{rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}
```
