# Indicador de etapas (StepIndicator)

Origem no sistema base: nenhum componente M3 equivalente direto (M3 tem stepper horizontal
genérico). Situação: **Adaptado** — especializado nas três etapas fixas do fluxo Anunciar.

## Quando usar

- No fluxo "Anunciar livro" (ver [05-padroes.md](../05-padroes.md), Padrão 2), para mostrar em
  qual das 3 etapas a pessoa está: livro, fotos e condições, revisão.

## Quando não usar

- Para navegação principal — isso é [Barra de navegação](barra-de-navegacao.md).

## Anatomia

1. Três segmentos em linha
2. Segmentos concluídos e o atual em `primary`
3. Segmentos restantes em `surface-container-highest`
4. Texto "Etapa N de 3" (só para leitor de tela — a barra em si é decorativa)

## Variantes

Não há variantes — sempre três etapas fixas.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Concluída | `primary` | - | Incluída na contagem "Etapa N de 3" |
| Atual | `primary` | - | "Etapa N de 3" é o que é lido |
| Futura | `surface-container-highest` | - | - |

## Acessibilidade

- A barra visual é decorativa (`importantForAccessibility="no"`); só o texto "Etapa N de 3" é
  anunciado.
- Contraste não se aplica diretamente (elemento decorativo), mas `primary` sobre
  `surface` já é 7,2:1.

## Faça e evite

- **Faça:** manter o texto "Etapa N de 3" sempre sincronizado com a etapa visual.
- **Evite:** usar cor sozinha para indicar progresso sem o texto de apoio.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function IndicadorDeEtapas({ etapaAtual }: { etapaAtual: 1 | 2 | 3 }) {
  return (
    <View>
      <Text accessibilityLiveRegion="polite">{`Etapa ${etapaAtual} de 3`}</Text>
      <View style={{ flexDirection: "row", gap: tokens.spacing[6] }} importantForAccessibility="no">
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={{ flex: 1, height: 4, borderRadius: tokens.radius.small, backgroundColor: n <= etapaAtual ? tokens.colors.action : tokens.colors.disabledBackground }}
          />
        ))}
      </View>
    </View>
  );
}
```
