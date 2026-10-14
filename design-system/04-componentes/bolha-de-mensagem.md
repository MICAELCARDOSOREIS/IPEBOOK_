# Bolha de mensagem (MessageBubble)

Origem no sistema base: nenhum componente M3 dedicado a chat. Situação: **Novo**.

## Quando usar

- Na tela de negociação/conversa (spec 004), para cada mensagem trocada.

## Quando não usar

- Para avisos do sistema dentro da conversa (ex. "Proposta aceita") — usar um estilo de linha
  centralizada separado, não a bolha.

## Anatomia

1. Container com canto de saída em `radius-xs`
2. Texto da mensagem
3. Indicador de estado (só na mensagem enviada): entregue, lida ou falha

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
