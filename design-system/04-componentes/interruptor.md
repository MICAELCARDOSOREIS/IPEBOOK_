# Interruptor (Switch)

Origem no sistema base: Material 3, Switch. Situação: **Herdado**.

## Quando usar

- Preferências que valem na hora, sem precisar de um botão Salvar — ex. notificações.

## Quando não usar

- Para uma escolha que precisa de confirmação explícita (use [Botão](botao.md) + ação).

## Anatomia

1. Rótulo à esquerda
2. Trilho (track) e alça (thumb) à direita
3. Toda a linha é alvo de toque, não só a chave

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Ligado | Preferência ativa | trilho `primary`, alça `on-primary` com check |
| Desligado | Preferência inativa | trilho `outline`, alça neutra |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Desligado | trilho `outline` | Toque liga | Anunciado como desligado |
| Ligado | trilho `primary`, check na alça | Toque desliga, aplica na hora | Anunciado como ligado |
| Desabilitado | opacidade 38% | Não responde | Anunciado como indisponível |

## Acessibilidade

- A linha inteira (rótulo + chave) é alvo de toque, mínimo 48 dp de altura.
- `accessibilityRole="switch"` com `accessibilityState={{ checked }}`.
- O check na alça ligada reforça o estado além da cor do trilho.

## Faça e evite

- **Faça:** aplicar a mudança imediatamente, sem exigir confirmação.
- **Evite:** usar Switch para uma ação que precisa de "Salvar" — isso quebra a expectativa de
  "liga na hora".

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function Interruptor({ rotulo, ligado, onToggle }: { rotulo: string; ligado: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: ligado }}
      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 48, paddingHorizontal: tokens.spacing[16] }}
    >
      <Text style={tokens.typography.bodyLarge}>{rotulo}</Text>
      <View style={{ width: 48, height: 28, borderRadius: tokens.radius.full, backgroundColor: ligado ? tokens.colors.action : tokens.colors.border, padding: 2, justifyContent: "center" }}>
        <View style={{ width: 22, height: 22, borderRadius: tokens.radius.full, backgroundColor: "#ffffff", alignSelf: ligado ? "flex-end" : "flex-start" }} />
      </View>
    </Pressable>
  );
}
```
