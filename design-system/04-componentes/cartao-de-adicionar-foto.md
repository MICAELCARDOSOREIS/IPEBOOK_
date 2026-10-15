# Cartão de adicionar foto (AddPhotoCard)

Origem no sistema base: Material 3, Outlined card (adaptação). Situação: **Novo** — não existe
um componente M3 dedicado para upload de foto; o Figma usa um `HorizontalCard` com um
`IconButtonStandard` dentro ("Material 3 · Adicionar foto", tela 04.01 · Anunciar — etapa 1).

## Quando usar

- Etapa de anúncio de livro, quando ainda não há foto enviada.

## Quando não usar

- Para mostrar uma foto já enviada — nesse caso o espaço mostra a miniatura, não este cartão.

## Anatomia

1. Borda tracejada (`border`, `border-style: dashed`)
2. Ícone de foto (`photo`, ver `AppIcon`)
3. Rótulo curto ("Adicionar foto")
4. Superfície `soft`, raio `radius-medium`

## Estados

| Estado | Aparência (tokens) | Comportamento | Acessibilidade |
| --- | --- | --- | --- |
| Padrão | borda tracejada `border`, texto `action` | Toque abre a câmera/galeria | `accessibilityRole="button"`, rótulo = texto visível |

## Acessibilidade

- Alvo de toque mínimo de 48 dp (`accessibility.touchTarget`).
- Ícone é decorativo; o rótulo textual carrega a ação.

## Código

Ver [`src/view/components/AddPhotoCard.tsx`](../../src/view/components/AddPhotoCard.tsx).
