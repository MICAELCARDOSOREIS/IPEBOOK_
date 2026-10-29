# Capa ilustrativa (BookCover)

Origem no sistema base: nenhuma. Situação: **Novo** — o Material 3 não define um componente de
imagem gerada por id; o IpêBook precisa dele porque nem todo anúncio tem foto, e a estante
precisa parecer organizada mesmo assim.

## Quando usar

- No lugar da foto do livro, sempre que o anúncio não tiver imagem enviada.

## Quando não usar

- Quando o anúncio tem foto real — a foto sempre tem prioridade sobre a capa ilustrativa.

## Anatomia

1. Fundo de cor sólida (token `cover.<cor>`)
2. Motivo decorativo (montanhas, ipê, ondas ou estrelas — ilustração, não token de cor)
3. Sol (token `cover-sun`)
4. Título e autor sobrepostos, a partir de 80 px de largura (token `cover-on`)

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Capa em lista (44 px) | BookRow, resultados de busca | só a arte, sem texto |
| Capa em cartão (≥ 80 px) | Detalhe do anúncio, Estante | arte + título + autor |

Cinco cores possíveis (`cover.blue`, `cover.brown`, `cover.green`; mais `cover-wine` e
`cover-ochre` no kit completo) × quatro motivos — a combinação é escolhida a partir do id do
anúncio, para a capa ser sempre a mesma entre telas e sessões.

## Estados

Capa ilustrativa é estática — não tem hover, pressionado ou foco próprios (o toque pertence ao
cartão que a envolve, não à capa).

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `cover.<cor>` + `cover-sun` + `cover.text` | Não responde a toque isoladamente | Texto alternativo com o título do livro |

## Acessibilidade

- Proporção fixa 120:170, elevação `elevation-1`.
- Texto alternativo sempre com o título do livro ("Capa ilustrativa de Dom Casmurro"); a
  ilustração decorativa (motivo, sol) fica oculta do leitor de tela.
- Contraste de `cover.text` sobre as cores de fundo: 5,4:1 a 10:1 (todas acima do mínimo de
  4,5:1).

## Faça e evite

- **Faça:** gerar a cor/motivo a partir do id do anúncio (determinístico), nunca aleatório a
  cada renderização.
- **Evite:** usar `brand-amber`/`cover-sun` fora da capa, como se fosse uma cor de texto comum.

## Código

```tsx
import { Text, View } from "react-native";
import { tokens } from "@/view/tokens";

const CORES_CAPA = [tokens.colors.cover.blue, tokens.colors.cover.brown, tokens.colors.cover.green] as const;

function BookCover({ idAnuncio, titulo }: { idAnuncio: string; titulo: string }) {
  const cor = CORES_CAPA[hashSimples(idAnuncio) % CORES_CAPA.length];
  return (
    <View
      accessibilityLabel={`Capa ilustrativa de ${titulo}`}
      style={{ backgroundColor: cor, borderRadius: tokens.radius.large, aspectRatio: 120 / 170 }}
    >
      <Text style={{ color: tokens.colors.cover.text, ...tokens.typography.labelMedium }}>{titulo}</Text>
    </View>
  );
}

function hashSimples(id: string): number {
  return [...id].reduce((soma, c) => soma + c.charCodeAt(0), 0);
}
```
