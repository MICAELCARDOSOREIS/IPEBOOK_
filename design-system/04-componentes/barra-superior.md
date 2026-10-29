# Barra superior (TopAppBar)

Origem no sistema base: Material 3, Top app bar (small). Situação: **Herdado**.

## Quando usar

- Em qualquer tela que não seja raiz: mostra o botão voltar e o nome da tela ("Detalhe",
  "Conversa").

## Quando não usar

- Em telas raiz (Início, Explorar, Estante, Conversas, Perfil) — essas usam o título grande da
  marca (`brand-large-title`) no próprio conteúdo, sem esta barra.

## Anatomia

1. Barra de 64 px, fundo `surface`
2. Botão voltar à esquerda
3. Título centralizado ou à esquerda (nome da tela, nunca de um estado)

## Variantes

Não há variantes — estrutura única em todo o app.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | fundo `surface` | - | Título lido como cabeçalho da tela |
| Rolada | `elevation-2` | Sombra aparece ao rolar o conteúdo | - |

## Acessibilidade

- Botão voltar com rótulo acessível "Voltar", alvo de toque 48 dp.
- Título com `accessibilityRole="header"`.

## Faça e evite

- **Faça:** o título é o nome da tela ("Detalhe").
- **Evite:** usar o título para mostrar um estado ("Senhas diferentes") — isso vai na mensagem
  de erro do campo, não na barra.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function BarraSuperior({ titulo, onVoltar }: { titulo: string; onVoltar: () => void }) {
  return (
    <View style={{ height: 64, flexDirection: "row", alignItems: "center", backgroundColor: tokens.colors.surface, paddingHorizontal: tokens.spacing[12] }}>
      <Pressable onPress={onVoltar} accessibilityLabel="Voltar" hitSlop={12}>
        <Text>←</Text>
      </Pressable>
      <Text accessibilityRole="header" style={{ marginLeft: tokens.spacing[12], ...tokens.typography.titleMedium }}>
        {titulo}
      </Text>
    </View>
  );
}
```
