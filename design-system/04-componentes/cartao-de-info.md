# Cartão de informação (InfoCard)

> [!NOTE]
> **AVALIAÇÃO / NÃO IMPLEMENTADO COMO COMPONENTE GENÉRICO (ADR 0019)**: Descartado como componente isolado. Blocos contextuais informativos utilizam containers locais estilizados com os tokens de design do sistema (`soft`, `actionDeep`, `border`).

Origem no sistema base: Material 3, Elevated/tonal card com ícone. Situação: **Herdado**.

## Quando usar

- Dicas de segurança e avisos no fluxo de negociação — ex. "Combine em lugar público".

## Quando não usar

- Para erro — erro vai no campo ([Campo de texto](campo-de-texto.md)) ou num
  [Snackbar](snackbar.md), nunca num InfoCard.

## Anatomia

1. Ícone à esquerda
2. Título curto
3. Descrição em uma ou duas linhas
4. Superfície tonal (`surface-container-low`)

## Variantes

Não há variantes de cor — um único estilo informativo, não condicional a severidade.

## Estados

InfoCard é estático — não tem interação própria.

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `surface-container-low`, `on-surface-variant` | Só leitura | Ícone decorativo oculto; título e texto lidos em sequência |

## Acessibilidade

- Ícone é decorativo — a informação completa está no título e na descrição em texto.
- Contraste `on-surface-variant` sobre `surface-container-low` ≥ 4,5:1.

## Faça e evite

- **Faça:** usar para dicas preventivas, nunca para erro já acontecido.
- **Evite:** empilhar mais de um InfoCard na mesma tela — dilui a atenção.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function CartaoDeInfo({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <View style={{ flexDirection: "row", gap: tokens.spacing[12], backgroundColor: tokens.colors.soft, borderRadius: tokens.radius.medium, padding: tokens.spacing[16] }}>
      <Text importantForAccessibility="no">ℹ️</Text>
      <View style={{ flex: 1 }}>
        <Text style={tokens.typography.titleMedium}>{titulo}</Text>
        <Text style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium }}>{descricao}</Text>
      </View>
    </View>
  );
}
```
