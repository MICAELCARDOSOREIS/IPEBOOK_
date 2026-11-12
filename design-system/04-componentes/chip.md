# Chip

Origem no sistema base: Material 3, Filter chip. Situação: **Herdado**.

## Quando usar

- Filtrar uma lista por modalidade, gênero ou categoria (Início, Explorar).

## Quando não usar

- Para mostrar metadados do próprio livro (estado, gênero, bairro) — isso é texto, não chip
  (ver [01-principios.md](../01-principios.md) §3).
- Como etiqueta não interativa — para isso use [Tag](tag.md).

## Anatomia

1. Container com raio de 8 dp (`radius.small`)
2. Ícone de check (`✓`) quando selecionado
3. Rótulo curto

## Tamanhos

| Tamanho | Altura | Padding lateral | Uso |
| --- | --- | --- | --- |
| `compact` (padrão) | 32 dp | 16 dp | Fileiras rápidas da Home (`02.01`) e do Explorar (`02.02`, `02.04`) |
| `regular` | 40 dp | 20 dp | Grupos de escolha de tela cheia: `Filtrar livros` (`02.03`) e `Detalhes do livro` (`04.05`) |

## Variantes

| Variante | Uso | Tokens |
| --- | --- | --- |
| Selecionado | Filtro ativo | `secondary-container` + check |
| Não selecionado | Filtro disponível | fundo `surface-container-lowest`, borda `outline-variant` |
| Com tom próprio | Modalidade ou opção com cor semântica | ponto da cor quando não selecionado; fundo e texto do tom quando selecionado |
| Aplicado (removível) | Filtro já aplicado sobre a lista (`02.04`) | mesma aparência do selecionado, rótulo com `✕` e ação de remover |

O chip **aplicado** não é um novo componente: é o mesmo `Chip` selecionado, com
`accessibilityLabel="Remover filtro …"` e `onPress` que remove aquele filtro (`removeActiveFilter`).
A diferença está na intenção: na fileira de cima se escolhe, na de baixo se retira o que já foi aplicado.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Não selecionado | Borda `outline-variant` | Toque seleciona | Anunciado como não selecionado |
| Selecionado | `secondary-container` + check | Toque remove o filtro | Anunciado como selecionado (não só pela cor — tem o check) |
| Aplicado (removível) | `secondary-container` + `✕` | Toque remove o filtro da busca | Rótulo explícito "Remover filtro …" |
| Desabilitado | `on-surface` 12%/38% | Não responde | Anunciado como indisponível |

## Acessibilidade

- Visual de 32 dp (ou 40 dp na tela de filtros), mas a área de toque é ampliada para 48 dp
  (`hitSlop={8}`).
- O check sinaliza a seleção — não depender só da cor; ver
  [01-principios.md](../01-principios.md) §2.
- O filtro aplicado usa o rótulo acessível fornecido pela tela (por exemplo,
  "Remover filtro Venda"); o caractere `✕` no texto é uma convenção visual da tela, não um
  estado interno adicional do componente.
- Papel de `checkbox` com `accessibilityState={{ checked, disabled }}`.

## Faça e evite

- **Faça:** usar Chip só para filtrar, nunca para exibir um dado fixo do item.
- **Faça:** limitar-se a duas fileiras no Explorar — a de escolha (`Todos` + categorias) e, só quando
  houver filtros aplicados, a de chips removíveis logo abaixo do resumo dos resultados.
- **Evite:** mais de uma fileira de chips **do mesmo tipo** competindo por atenção na mesma tela.
- **Evite:** repetir nos chips aplicados o que já está marcado na fileira de escolha (a categoria, por
  exemplo, aparece com check em cima e não volta embaixo).

## Código

```tsx
import { Chip } from "@/view/components/Chip";

// Fileira de escolha (Explorar, Home): 32 dp
<Chip label="Literatura" selected={category === "Literatura"} onPress={() => setCategory("Literatura")} />

// Grupo de escolha em formulario ou tela de filtros: 40 dp
<Chip label="Venda" size="regular" selected={draft.modality === "sale"} onPress={() => setModality("sale")} />

// Filtro já aplicado (chip removível) — rótulo e ação explícitos
<Chip
  label="Venda ✕"
  selected
  accessibilityLabel="Remover filtro Venda"
  onPress={() => onRemoveFilter("modality")}
/>
```
