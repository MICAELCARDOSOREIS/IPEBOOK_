# Botão flutuante (Fab)

Origem no sistema base: Material 3, Extended FAB. Situação: **Adaptado** — M3 permite FAB em
qualquer tela; o IpêBook restringe a uma única tela e ação.

## Quando usar

- Só na Estante, para a ação "Anunciar livro" — a única ação de criação do app com destaque de
  FAB.

## Quando não usar

- Em qualquer outra tela. Não existe um segundo FAB no app.
- No iOS (quando entrar em escopo) — usar um botão de vidro na barra, não este componente.

## Anatomia

1. Container estendido, canto inferior direito, acima da barra de navegação
2. Ícone + rótulo "Anunciar livro"
3. `elevation-3`

## Variantes

Não há variantes — um único FAB, numa única tela.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `primary-container`, `on-primary-container` | Aguarda toque | Anunciado como botão "Anunciar livro" |
| Pressionado | `elevation-4` | Abre o fluxo de 3 etapas | - |

## Acessibilidade

- Alvo de toque mínimo de 48 dp (o FAB estendido já é maior que isso).
- Não sobrepor conteúdo interativo da lista — reservar espaço inferior na Estante.

## Faça e evite

- **Faça:** manter o rótulo "Anunciar livro" sempre visível (FAB estendido, não só ícone).
- **Evite:** adicionar um segundo FAB em outra tela — centraliza a criação de anúncio num único
  ponto do app.

## Código

```tsx
import { Pressable, Text } from "react-native";
import { tokens } from "@/view/tokens";

function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Anunciar livro"
      style={{ position: "absolute", right: tokens.spacing[16], bottom: tokens.spacing[16], backgroundColor: tokens.colors.soft, borderRadius: tokens.radius.large, paddingHorizontal: tokens.spacing[16], paddingVertical: tokens.spacing[12] }}
    >
      <Text style={{ color: tokens.colors.action, ...tokens.typography.labelMedium }}>+ Anunciar livro</Text>
    </Pressable>
  );
}
```
