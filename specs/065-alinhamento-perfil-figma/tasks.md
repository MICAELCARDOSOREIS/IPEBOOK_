# Tarefas — Spec 065: Alinhamento Visual do Perfil ao Figma

- [x] **T01 — Decisão Arquitetural (ADR 0048)**
  - Criar `docs/adr/0048-alinhamento-perfil-figma.md` e registrar em `docs/adr/README.md`.
- [x] **T02 — Refatorar `src/view/profile/profileHub.tsx`**
  - Título editorial com `fontFamily.brand` e cor `brandBrown`.
  - Card de identidade suave com serifa no nome e dados de localização.
  - Botão outline proeminente "Editar perfil".
  - Tríade de métricas comunitárias (publicações, trocas, avaliação).
  - Seções agrupadas "Atividade" e "Conta" com chevrons vetoriais `chevronRight`.
  - Integração do alternador de tema e diálogo de logout.
- [x] **T03 — Atualizar Testes de Componente**
  - Executar e atualizar `tests/components/profileHubView.test.tsx` (8 testes passando).
- [x] **T04 — Validação no Aparelho via ADB e Suíte Completa**
  - Capturar screenshot no celular via ADB (`perfil_pos.png`).
  - Executar `npm test` (162/162 arquivos e 1132/1132 testes verdes), `npm run check:architecture` e `npm run check:numbering`.
