# Validação — Spec 074

## Automatizada (2026-10-26)

`npm run validate` aprovado: 174 arquivos / 1.274 testes, `tsc --noEmit` limpo, 0 violações de
arquitetura, 74 specs e 64 ADRs sem colisão. Testes novos em
`tests/components-mocked/bookDetailView.test.tsx` cobrem CA1–CA5 e falharam antes da implementação;
`tests/integration/sc006DetalheLivroIntegration.test.tsx` passou a acionar "Quero receber" (doação).

## Aparelho Android (Galaxy A16, ADB, Expo Go)

- Venda, tema claro: capa sobre verde-claro, "R$ 8,00 · Venda", lista de detalhes, anunciante,
  barra "Compartilhar" + "Tenho interesse". **Aprovado (CA7).**
- Doação, tema escuro: fundo terracota, "Gratuito · Doação", cartão "Doação para quem vai ler",
  "Quero receber". **Aprovado.**
- Anúncio próprio, tema escuro: só "Compartilhar", em largura total. **Aprovado.**
- Troca não conferida em aparelho (não há anúncio de troca no catálogo atual); coberta por teste.

## Pendência observada

No tema claro com o sistema em modo escuro, os ícones da barra de status ficam claros sobre a capa
clara; a barra de status segue o tema do sistema, não o do app. Comportamento anterior a esta spec.
