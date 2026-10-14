# Logotipo (Logo)

Origem no sistema base: nenhum — identidade própria da marca. Situação: **Novo**.

## Quando usar

- No topo das telas raiz (Início) e em qualquer ponto que precise da marca escrita.

## Quando não usar

- Sobre fotos ou capas sem usar a variante `inverse` — perde contraste.

## Anatomia

1. O nome "IpêBook" em Source Serif 4 Bold — não há símbolo gráfico, é só tipográfico.

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Padrão | Fundos claros (`surface`) | `brand-brown` |
| Inverse | Fundos escuros ou sobre capas | `cover-on` |

## Estados

Logotipo é estático — não tem interação nem estados.

## Acessibilidade

- Contraste `brand-brown` sobre `surface` = 10,6:1.
- `accessibilityRole="header"` quando usado como título da tela raiz.

## Faça e evite

- **Faça:** manter a fonte e o acento exatos do logotipo.
- **Evite:** recriar com outra fonte, remover o acento do "ê" ou adicionar um símbolo gráfico
  que não existe na marca.

## Código

```tsx
import { Text } from "react-native";
import { tokens } from "@/view/tokens";

function Logotipo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Text
      accessibilityRole="header"
      style={{ fontFamily: "SourceSerif4_700Bold", fontSize: 24, color: inverse ? tokens.colors.cover.text : tokens.colors.brandBrown }}
    >
      IpêBook
    </Text>
  );
}
```
