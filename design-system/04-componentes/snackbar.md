# Snackbar

Origem no sistema base: Material 3, Snackbar. Situação: **Herdado**.

## Quando usar

- Confirmar algo que acabou de acontecer: "Anúncio publicado", "Proposta enviada".

## Quando não usar

- Para pedir confirmação antes de uma ação — isso é [Diálogo](dialogo.md), não Snackbar.

## Anatomia

1. Container em `inverse-surface`, `elevation-3`
2. Texto curto (`inverse-on-surface`)
3. Ação opcional, no máximo uma (`inverse-primary`), ex. "Desfazer"

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Sem ação | Confirmação simples | `inverse-surface`/`inverse-on-surface` |
| Com ação | Confirmação reversível ("Desfazer") | + `inverse-primary` |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Visível | `inverse-surface`, flutuando sobre o conteúdo | Some sozinho em 4 a 10 s | Anunciado via região de status (`role="status"` na Web / `accessibilityLiveRegion="polite"` no RN) |
| Com ação tocada | - | Executa a ação e fecha | Ação tem seu próprio rótulo acessível |

## Acessibilidade

- Nunca é a única forma de confirmar uma ação crítica — ações destrutivas usam
  [Diálogo](dialogo.md) antes, não Snackbar depois.
- Contraste `inverse-on-surface` sobre `inverse-surface` = 11,7:1.

## Faça e evite

- **Faça:** uma mensagem curta no passado ("Anúncio publicado").
- **Evite:** duas ações no mesmo Snackbar, ou deixá-lo mais de 10 s na tela.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function Snackbar({ mensagem, acao, onAcao }: { mensagem: string; acao?: string; onAcao?: () => void }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#322f2b", borderRadius: tokens.radius.small, padding: tokens.spacing[16] }}
    >
      <Text style={{ color: "#f5efe8", flex: 1, ...tokens.typography.bodyMedium }}>{mensagem}</Text>
      {acao ? (
        <Pressable onPress={onAcao}>
          <Text style={{ color: tokens.colors.soft, ...tokens.typography.labelMedium }}>{acao}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
```
