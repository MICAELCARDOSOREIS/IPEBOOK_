# Validação — Spec 050

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/unit/shareUseCases.test.ts`: mensagem formatada para troca, venda (com preço) e doação;
  URL do WhatsApp com o texto codificado.
- `tests/hooks/useShareListingViewModel.test.tsx` (`shareToWhatsApp`): abre o WhatsApp quando
  `Linking.canOpenURL` é verdadeiro; recorre ao menu nativo (`Share.share`) quando é falso; usa a
  Web Share API quando disponível; copia a mensagem quando não há Web Share API.
- `tests/components-mocked/bookDetailView.test.tsx`: botão "Compartilhar no WhatsApp" aciona
  `shareToWhatsApp` com título, autor, modalidade e preço do anúncio.
- Testes pré-existentes de compartilhamento genérico (`share`) continuam passando sem alteração de
  comportamento.

## Comandos executados

- `npx vitest run` (arquivos de compartilhamento e detalhe do livro): **31 testes aprovados.**
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0.

## Limitações

- Abertura real do WhatsApp em dispositivo físico e a Web Share API em navegador real não foram
  verificadas manualmente nesta entrega; apenas os contratos (`Linking.canOpenURL`/`openURL`,
  `navigator.share`) foram validados por teste automatizado.
