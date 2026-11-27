# Fita Marcadora (IpeRibbon)

> [!NOTE]
> **IMPLEMENTADO** em `src/view/components/IpeRibbon.tsx` e usado no cartão de compartilhamento em `src/view/components/ListingShareCard.tsx`.

Origem no sistema base: **Novo** — elemento inspirado nas encadernações clássicas de livros físicos de capa dura com fita marcadora de cetim, tingida no ouro solar do Ipê-Amarelo de Piripiri (`colors.ipe.bloom`).

## Quando usar

- Decorar o cartão de compartilhamento de um livro.
- Como metáfora tátil de folheio e leitura física.

## Quando não usar

- Em elementos não relacionados a livros, capas ou cartões de leitura.
- Como botão ou elemento interativo de clique (é um ornamento visual não-interativo).

## Anatomia

1. Fita vertical em ouro solar do Ipê (`colors.ipe.bloom`, `#F5B718`)
2. Borda inferior em corte de cetim com sombra sutil (`colors.ipe.bloomDeep`, `#D97706`)
3. Filete lateral interno simulando o brilho do tecido de cetim

## Acessibilidade

- Componente puramente decorativo.
- Marcado com `accessible={false}`, `importantForAccessibility="no-hide-descendants"` e `accessibilityElementsHidden`, sem poluir a árvore do leitor de tela nem bloquear toques (`pointerEvents="none"`).

## Código

```tsx
import { IpeRibbon } from "@/view/components/IpeRibbon";

<IpeRibbon width={18} height={42} />
```
