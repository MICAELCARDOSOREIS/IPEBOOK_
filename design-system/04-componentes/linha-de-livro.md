# Linha de livro (BookRow)

Origem no sistema base: Material 3, List item (duas linhas + mídia). Situação: **Adaptado** — o
M3 define a estrutura de item de lista; os dados mostrados (capa, título, autor, bairro, tag)
são específicos do domínio do app (ver [01-principios.md](../01-principios.md) §3).

## Quando usar

- Listar livros na Estante, nos Favoritos e nos resultados de busca.

## Quando não usar

- Para o cartão de detalhe do anúncio (ali o layout é maior, não uma linha).

## Anatomia

1. [Capa ilustrativa](capa-ilustrativa.md) pequena (44 px) ou foto real
2. Título do livro (token `brand-card-title`, ver [02-tokens.md](../02-tokens.md))
3. `meta`: autor e bairro, formato "Machado de Assis · Centro" (token `m3-body-md`)
4. [Tag](tag.md) de modalidade

## Variantes

Não há variantes visuais — a mesma estrutura serve Estante, Favoritos e busca.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | `surface`/`surface-container-low` de fundo | Toque abre o Detalhe | Rótulo composto: título, autor, bairro, modalidade |
| Pressionado | Camada de 10% | Ripple | - |

## Acessibilidade

- Alvo de toque mínimo de 48 dp (a linha inteira, não só o texto).
- Nunca mostrar distância nem nota — o app não tem esses dados (Princípio 3).
- `accessibilityLabel` compõe título + autor + bairro + modalidade num único anúncio.

## Faça e evite

- **Faça:** usar sempre "Autor · Bairro" nessa ordem, igual em toda tela que usa `BookRow`.
- **Evite:** adicionar distância, nota ou qualquer dado que o backend não envia.

## Código

```tsx
import { Pressable, Text, View } from "react-native";
import { tokens } from "@/view/tokens";
import { BookCover } from "./capa-ilustrativa";
import { Tag } from "./tag";

function BookRow({ id, titulo, autor, bairro, modalidade, onPress }: { id: string; titulo: string; autor: string; bairro: string; modalidade: "venda" | "troca" | "doacao"; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${titulo}, ${autor}, ${bairro}`}
      style={{ flexDirection: "row", gap: tokens.spacing[12], padding: tokens.spacing[12], alignItems: "center" }}
    >
      <BookCover idAnuncio={id} titulo={titulo} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: tokens.colors.text, fontFamily: "SourceSerif4_700Bold", fontSize: 19 }}>{titulo}</Text>
        <Text style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium }}>{`${autor} · ${bairro}`}</Text>
        <Tag tipo={modalidade} />
      </View>
    </Pressable>
  );
}
```
