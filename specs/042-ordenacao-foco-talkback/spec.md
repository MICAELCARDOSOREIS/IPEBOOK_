# Spec 042 — Ordenação lógica de foco e anúncios TalkBack (Issue #147)

## Contexto

A auditoria inicial de acessibilidade (Issue #96) apontou que os formulários extensos
(`/anunciar`, `/denunciar/[id]`, `/excluir-conta`) precisam de ordem de leitura/foco lógica e de
anúncios claros em transições de etapa e erros. Figma fluxo 12 · Acessibilidade,
`12.04 · Navegação por leitor de tela`.

## Escopo

- Verificar a ordem de tabulação/foco nos três formulários alvo: `CreateListing` (`/anunciar`),
  `ReportListing` (`/denunciar/[id]`) e `DeleteAccount` (`/excluir-conta`).
- Quando a submissão falha, a mensagem de erro deve ser anunciada automaticamente para leitores de
  tela (TalkBack/VoiceOver/NVDA) e deve receber o foco, em vez de ficar silenciosa até a pessoa
  navegar manualmente até ela.

## Decisão

Criado o hook reutilizável `useFormErrorAnnouncer` (`src/view/useFormErrorAnnouncer.ts`): recebe a
mensagem de erro do viewmodel e, quando ela aparece ou muda, chama
`AccessibilityInfo.announceForAccessibility` e move o foco (via `ref.focus()`) para o elemento de
erro. Os três formulários alvo passaram a usar o hook em seus banners de erro de submissão
(`state.error` em `CreateListing`/`ReportListing`; `state.error` e `state.exportError` em
`DeleteAccount`), com `accessibilityLiveRegion="assertive"` e `focusable` nos elementos de texto.

Os erros de campo individuais (`TextField`) já ficam contextualmente ligados ao campo via
`aria-describedby`/`nativeID` — não precisaram de mudança, pois já respeitam a ordem de leitura
natural (erro logo após o campo que falhou).

## Critérios de aceite

- [x] Foco guiado automaticamente para mensagens de erro ao submeter formulário inválido.
- [x] Sem saltos de foco ilógicos em navegação por teclado e TalkBack (nenhuma mudança de ordem do
      DOM/árvore de acessibilidade foi necessária; os formulários já seguiam a ordem visual).
- [x] Testes automatizados cobrindo o anúncio e o atributo de live region.
- [x] `npm run validate` passando.
