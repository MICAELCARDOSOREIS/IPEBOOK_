# Cartão de adicionar foto (AddPhotoCard)

Origem no sistema base: Material 3, Outlined card (adaptação). Situação: **Novo** — não existe
um componente M3 dedicado para upload de foto; o Figma usa um `HorizontalCard` com um
`IconButtonStandard` dentro ("Material 3 · Adicionar foto", tela 04.01 · Anunciar — etapa 1).
Conferido contra o screenshot real da tela em 2026-10-15: é um **quadrado** ao lado dos campos
de título/autor, não uma faixa de largura total.

## Quando usar

- Etapa de anúncio de livro, quando ainda não há foto enviada.

## Quando não usar

- Para mostrar uma foto já enviada — nesse caso o espaço mostra a miniatura, não este cartão.

## Anatomia

1. Quadrado (`aspect-ratio: 1`), borda sólida `outline-variant`, fundo `surface`
2. Ícone "+" (`add`, ver `AppIcon`) centralizado
3. Rótulo curto abaixo do ícone ("Foto da capa")

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | borda `outline-variant`, ícone e texto `action` | Toque abre a câmera/galeria | `accessibilityRole="button"`, rótulo = "Adicionar " + texto visível |

## Acessibilidade

- Largura/altura mínimas de 2× `accessibility.touchTarget` (96 dp), bem acima do alvo de 48 dp.
- Ícone é decorativo; o rótulo acessível ("Adicionar foto da capa") deixa a ação explícita, não
  só "Foto da capa".

## Código

Ver [`src/view/components/AddPhotoCard.tsx`](../../src/view/components/AddPhotoCard.tsx).
