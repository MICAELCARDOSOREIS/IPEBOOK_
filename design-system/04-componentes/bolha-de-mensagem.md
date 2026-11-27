# Bolha de mensagem (MessageBubble)

> [!NOTE]
> **IMPLEMENTADO (Specs 061, 082, 086, 089 · ADRs 0044 e 0062)**: Embora o [ADR 0011](../../docs/adr/0011-navegacao-tres-destinos.md) tenha iniciado o beta sem chat síncrono, a conversa em tempo real vinculada a cada negociação foi entregue em [`src/view/conversations/chat.tsx`](../../src/view/conversations/chat.tsx) e [`src/view/conversations/chatStyles.ts`](../../src/view/conversations/chatStyles.ts). Os envios usam bolhas agrupadas por remetente com `tokens.radius.bubbleCorner` (6 dp) no canto de saída, horário formatado (`labelSmall`), rótulo acessível completo no leitor de tela e cartões centrais dedicados para propostas/status (`ChatProposalCards.tsx` e `NegotiationStatusCard.tsx`).

Origem no sistema base: nenhum componente M3 dedicado a chat. Situação: **Novo**.

## Quando usar

- Na tela de negociação/conversa ([`src/view/conversations/chat.tsx`](../../src/view/conversations/chat.tsx) — Specs 061, 082, 086 e 089), para cada mensagem trocada.

## Quando não usar

- Para avisos do sistema ou cartões de proposta dentro da conversa (ex.: "Proposta aceita") — usar `ChatProposalCards` / `NegotiationStatusCard`, não a bolha.

## Anatomia

1. Container com cantos amplos (`radius.large` / `radius.xl`) e canto de saída em `radius.bubbleCorner` (6 dp)
2. Texto da mensagem (`bodyLarge` / `bodyMedium`)
3. Horário formatado (`formatBubbleTime`, `labelSmall`) e leitor de tela completo (`Você às HH:MM: ...`)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Recebida | Mensagem da outra pessoa | `surface-container-high`, alinhada à esquerda |
| Enviada | Mensagem própria | `primary-container`, alinhada à direita |

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Entregue | ícone de check simples | - | "Você, 14:32, entregue" |
| Lida | dois checks em `primary` | - | "Você, 14:32, lida: …" |
| Falha | ícone `error` + "Tentar de novo" na própria bolha | Toque reenvia | "Falha ao enviar, toque para tentar de novo" |

## Acessibilidade

- Largura máxima de 75% da tela — nunca ocupa a largura toda.
- O leitor de tela lê remetente, horário e estado numa única frase: "Você, 14:32, lida: …".
- Falha de envio não gera uma tela de erro separada — a ação de reenviar fica na própria bolha.

## Faça e evite

- **Faça:** manter o estado de envio sempre visível na última mensagem enviada.
- **Evite:** uma tela de erro cheia para falha de envio — resolve-se na própria bolha.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";

function BolhaDeMensagem({ texto, horario, propria, estado }: { texto: string; horario: string; propria: boolean; estado?: "entregue" | "lida" | "falha" }) {
  const rotulo = estado ? `Você, ${horario}, ${estado}` : `${horario}`;
  return (
    <Pressable
      disabled={estado !== "falha"}
      accessibilityLabel={propria ? rotulo : undefined}
      style={{
        maxWidth: "75%",
        alignSelf: propria ? "flex-end" : "flex-start",
        backgroundColor: propria ? tokens.colors.soft : tokens.colors.surface,
        borderRadius: tokens.radius.large,
        padding: tokens.spacing[12],
      }}
    >
      <Text style={tokens.typography.bodyLarge}>{texto}</Text>
      {propria ? <Text style={{ color: estado === "falha" ? tokens.colors.error : tokens.colors.secondaryText, fontSize: 11 }}>{estado === "falha" ? "Falha — tentar de novo" : estado}</Text> : null}
    </Pressable>
  );
}
```
