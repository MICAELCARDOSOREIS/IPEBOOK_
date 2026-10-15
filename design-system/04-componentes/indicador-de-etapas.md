# Indicador de etapas (StepIndicator)

Origem no sistema base: nenhum componente M3 equivalente direto (M3 tem stepper horizontal
genérico). Situação: **Adaptado** — barra de progresso contínua, não um stepper de passos
discretos. Verificado contra as telas reais do fluxo "Anunciar livro" no Figma em 2026-10-15
(telas 04.01 e 04.05): o preenchimento é proporcional a `etapaAtual / totalDeEtapas`, não três
segmentos de largura igual.

## Quando usar

- No fluxo "Anunciar livro" (ver [05-padroes.md](../05-padroes.md), Padrão 2), para mostrar o
  progresso entre as etapas: livro, fotos e condições, revisão.

## Quando não usar

- Para navegação principal — isso é [Barra de navegação](barra-de-navegacao.md).

## Anatomia

1. Linha de rótulos: "Etapa N de 3" à esquerda, nome da etapa atual à direita
2. Trilho único em pílula (`radius-full`), 4 px de altura, fundo `secondary-container`
3. Preenchimento em `primary`, largura proporcional a `etapaAtual / totalDeEtapas`
4. Ponto decorativo em `primary` no fim do trilho, marcando a conclusão do fluxo

## Variantes

Não há variantes — sempre a mesma barra; o que muda é a proporção preenchida.

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Em progresso | preenchido `primary`, restante `secondary-container` | Largura do preenchido cresce a cada etapa | "Etapa N de 3" é o que é lido |
| Concluído (última etapa) | barra inteira em `primary` | - | Incluído na contagem "Etapa N de 3" |

## Acessibilidade

- A barra visual é decorativa (`importantForAccessibility="no"`); só o texto "Etapa N de 3" é
  anunciado.
- `primary` sobre `secondary-container` e sobre `surface` têm contraste suficiente para um
  elemento não textual (WCAG 1.4.11, ≥ 3:1).

## Faça e evite

- **Faça:** manter o texto "Etapa N de 3" sempre sincronizado com a etapa visual.
- **Evite:** usar cor sozinha para indicar progresso sem o texto de apoio.

## Código

Ver [`src/view/components/StepProgress.tsx`](../../src/view/components/StepProgress.tsx).
