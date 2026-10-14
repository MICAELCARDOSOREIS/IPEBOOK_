# Estado vazio (EmptyState)

Origem no sistema base: nenhum componente M3 dedicado (M3 trata estado vazio como composição
livre). Situação: **Adaptado** — padronizado para as cinco listas do app.

## Quando usar

- Quando a Estante, Favoritos, Conversas, Notificações ou um resultado de busca não têm
  conteúdo.

## Quando não usar

- Para erro de carregamento (isso é uma mensagem de erro com "Tentar de novo", não um estado
  vazio).

## Anatomia

1. Ilustração ou ícone decorativo (oculto do leitor de tela)
2. Título na serifa da marca (`brand-card-title`)
3. Texto que diz o próximo passo concreto
4. No máximo uma ação Contornada (ver [Botão](botao.md))

## Variantes

| Variante | Uso | Exemplo de texto |
| --- | --- | --- |
| Estante vazia | Nenhum anúncio ainda | "Sua estante está vazia. Anuncie um livro que você já leu para vender, trocar ou doar para alguém do seu bairro." |
| Busca sem resultado | Filtro ou termo sem correspondência | "Nenhum livro encontrado no seu bairro com esse termo." |

## Estados

Estado vazio não tem variações de interação — é estático; só o botão opcional tem seus próprios
estados (ver [Botão](botao.md)).

## Acessibilidade

- A barra superior e a navegação continuam visíveis — não é uma tela cheia isolada.
- Ilustração decorativa oculta do leitor de tela; só título e texto são lidos.

## Faça e evite

- **Faça:** o texto sempre diz o próximo passo concreto, nunca só "Nada aqui".
- **Evite:** mais de uma ação no estado vazio — se tiver dúvida entre duas, escolha a mais
  provável.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { BotaoContornado } from "./botao";

function EstadoVazio({ titulo, texto, rotuloAcao, onAcao }: { titulo: string; texto: string; rotuloAcao?: string; onAcao?: () => void }) {
  return (
    <View style={{ alignItems: "center", padding: tokens.spacing[32] }}>
      <View importantForAccessibility="no" style={{ width: 96, height: 96, borderRadius: tokens.radius.full, backgroundColor: tokens.colors.soft }} />
      <Text style={{ fontFamily: "SourceSerif4_700Bold", fontSize: 19, marginTop: tokens.spacing[16] }}>{titulo}</Text>
      <Text style={{ color: tokens.colors.secondaryText, textAlign: "center", ...tokens.typography.bodyMedium }}>{texto}</Text>
      {rotuloAcao ? <BotaoContornado label={rotuloAcao} onPress={onAcao!} /> : null}
    </View>
  );
}
```
