# Chip

Origem no sistema base: Material 3, Filter chip. Situação: **Herdado**.

## Quando usar

- Filtrar uma lista por modalidade, gênero ou distância (Início, Explorar).

## Quando não usar

- Para mostrar metadados do próprio livro (estado, gênero, bairro) — isso é texto, não chip
  (ver [01-principios.md](../01-principios.md) §3).
- Como etiqueta não interativa — para isso use [Tag](tag.md).

## Anatomia

1. Container de 32 px, pílula (`radius-full`)
2. Ícone de check quando selecionado
3. Rótulo curto

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Selecionado | Filtro ativo | `secondary-container`, check |
| Não selecionado | Filtro disponível | borda `outline` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Não selecionado | Borda `outline` | Toque seleciona | Anunciado como não selecionado |
| Selecionado | `secondary-container` + check | Toque remove o filtro | Anunciado como selecionado (não só pela cor — tem o ícone de check) |
| Desabilitado | `on-surface` 12%/38% | Não responde | Anunciado como indisponível |

## Acessibilidade

- Visual de 32 px, mas a área de toque é ampliada para 48 dp (padding invisível/`hitSlop`).
- O check (não só a cor) sinaliza a seleção — ver [01-principios.md](../01-principios.md) §2.

## Faça e evite

- **Faça:** usar Chip só para filtrar, nunca para exibir um dado fixo do item.
- **Evite:** mais de uma linha de chips competindo por atenção na mesma tela.

## Código

```tsx
import { Pressable, Text } from "react-native";
import { tokens } from "@/view/tokens";

function ChipDeFiltro({ rotulo, selecionado, onPress }: { rotulo: string; selecionado: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selecionado }}
      hitSlop={8}
      style={{
        height: 32,
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[12],
        justifyContent: "center",
        backgroundColor: selecionado ? tokens.colors.soft : "transparent",
        borderWidth: selecionado ? 0 : 1,
        borderColor: tokens.colors.border,
      }}
    >
      <Text style={{ color: selecionado ? tokens.colors.action : tokens.colors.secondaryText, ...tokens.typography.labelMedium }}>
        {selecionado ? `✓ ${rotulo}` : rotulo}
      </Text>
    </Pressable>
  );
}
```
