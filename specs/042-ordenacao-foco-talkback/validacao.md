# Validação — Spec 042

**Data:** 21 de outubro de 2026

## O que foi testado

- `tests/hooks/useFormErrorAnnouncer.test.tsx`: não anuncia sem erro; anuncia quando o erro
  aparece; não repete o anúncio quando a mesma mensagem persiste entre renders; anuncia de novo
  quando a mensagem muda; foca o elemento referenciado quando o erro aparece.
- `tests/components/reportListingView.test.tsx`: submissão sem motivo selecionado aciona o
  anúncio de acessibilidade com a mensagem exibida e o atributo `accessibilityLiveRegion="assertive"`.
- `tests/components/createListingView.test.tsx`: erro de publicação (viewmodel mockado) aciona o
  anúncio com a mensagem do erro.
- `tests/components/deleteAccountView.test.tsx`: submissão sem marcar a confirmação aciona o
  anúncio e o live region no erro exibido.

## Comandos executados

- `npx vitest run tests/hooks/useFormErrorAnnouncer.test.tsx tests/components/reportListingView.test.tsx tests/components/createListingView.test.tsx tests/components/deleteAccountView.test.tsx`: **34 testes aprovados**.
- `npm run typecheck`: aprovado.
- `npm run validate` (typecheck, `check:architecture`, `test:sql` via PGlite, `test:coverage`):
  aprovado, código de saída 0. Cobertura: Statements 91.19%, Branches 83.71%, Functions 88.29%,
  Lines 92.68%.
- `npm run build:web`: aprovado.

## Limitações

- Verificação manual com TalkBack/VoiceOver real em dispositivo físico não realizada nesta
  entrega; o comportamento foi validado via o contrato de chamada de
  `AccessibilityInfo.announceForAccessibility`, que é a API padrão do React Native para esse fim.
- Na Web, o foco programático (`ref.focus()`) depende do elemento ser focável; como o `Text` do
  React Native não expõe a prop `focusable` nos tipos usados neste projeto, o foco direto no erro
  funciona de forma best-effort (nenhum erro é lançado se o elemento não aceitar foco) — o anúncio
  por `role="alert"` (ARIA, equivalente a um live region assertivo) garante a notificação mesmo
  quando o foco não se move.
