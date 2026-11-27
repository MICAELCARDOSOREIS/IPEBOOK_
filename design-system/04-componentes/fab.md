# Botão flutuante (Fab)

> [!NOTE]
> **IMPLEMENTADO EM MINHA ESTANTE (ADR 0084 · Spec 109)**: Aplicado exclusivamente na tela [`src/view/listings/myListings.tsx`](../../src/view/listings/myListings.tsx) quando há livros cadastrados fora do modo Web largo (`!wideWeb`). No código atual, o componente segue o FAB padrão M3 de **56 × 56 dp** (`tokens.spacing[56]`, `borderRadius: tokens.radius.card`, fundo `colors.m3.primaryContainer`, ícone `AppIcon name="add"` em `onPrimaryContainer`), `accessibilityLabel="Anunciar livro"` e metamorfose de canto ao toque (`tokens.shapeMorph.cardPressed`). Em Web larga e estados vazios, a criação ocorre pelos botões da barra/vazio.

Origem no sistema base: Material 3, FAB (56 dp) restrito a uma única tela. Situação: **Adaptado** — M3 permite FAB em
qualquer tela; o IpêBook restringe a uma única tela e ação.

## Quando usar

- Só na Estante, para a ação "Anunciar livro" — a única ação de criação do app com destaque de
  FAB.

## Quando não usar

- Em qualquer outra tela. Não existe um segundo FAB no app.
- No iOS (quando entrar em escopo) — usar um botão de vidro na barra, não este componente.

## Anatomia

1. Container quadrado arredondado **56 × 56 dp** (`tokens.spacing[56]`, `tokens.radius.card`), canto inferior direito, posicionado acima da barra de navegação (`fabBottom`)
2. Ícone `"add"` (`24 dp`, `colors.m3.onPrimaryContainer`) + `accessibilityLabel="Anunciar livro"`
3. Fundo `colors.m3.primaryContainer`, `elevation: 6` e metamorfose de canto ao pressionar (`tokens.shapeMorph.cardPressed`)

## Variantes

Não há variantes — um único FAB na tela `Minha Estante` mobile/estreita (na Web larga a ação fica no cabeçalho).

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `m3.primaryContainer`, `m3.onPrimaryContainer` | Aguarda toque | Anunciado como botão "Anunciar livro" |
| Pressionado | `scale(0.94)`, `shapeMorph.cardPressed` | Abre o fluxo de 3 etapas | - |

## Acessibilidade

- Alvo de toque de **56 × 56 dp** (acima do mínimo de 48 dp) com `accessibilityLabel="Anunciar livro"`.
- Não sobrepor conteúdo interativo da lista — reservar espaço inferior na Estante.

## Faça e evite

- **Faça:** manter o `accessibilityLabel="Anunciar livro"` claro para leitores de tela e respeitar o respiro sobre a barra de navegação.
- **Evite:** adicionar um segundo FAB em outra tela — centraliza a criação de anúncio num único
  ponto do app.

## Código

```tsx
import { Pressable } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { useTheme } from "@/view/theme/ThemeProvider";
import { tokens } from "@/view/tokens";

function Fab({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Anunciar livro"
      style={({ pressed }) => [
        {
          position: "absolute",
          right: tokens.spacing[16],
          bottom,
          width: tokens.spacing[56],
          height: tokens.spacing[56],
          borderRadius: pressed ? tokens.shapeMorph.cardPressed : tokens.radius.card,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.m3.primaryContainer,
          elevation: 6,
        },
      ]}
    >
      <AppIcon name="add" size={24} color={colors.m3.onPrimaryContainer} />
    </Pressable>
  );
}
```
