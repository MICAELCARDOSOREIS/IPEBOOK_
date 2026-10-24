# Tarefas — Spec 064: Alinhamento Visual da Estante ao Figma

- [x] **T01 — Documentação Arquitetural (ADR 0047)**
  - Criar `docs/adr/0047-alinhamento-estante-figma.md` e atualizar o índice em `docs/adr/README.md`.
- [x] **T02 — Refatorar `src/view/listings/shelfRow.tsx`**
  - Ajustar dimensões da capa (56x80px canônico em `BookCover.tsx`) e estilização de supporting text e chevron trailing.
- [x] **T03 — Refatorar `src/view/listings/myListings.tsx` e `myListingsEmpty.tsx`**
  - Cabeçalho editorial "Minha estante" com `fontFamily.brand`.
  - Abas Material 3: `Anúncios (n)`, `Propostas (n)` e `Concluídos`.
  - Indicador ativo e divisória horizontal (`Divider`).
  - Extended FAB com ícone `+` e texto `"Anunciar livro"`.
  - Supressão de botão voltar artificial quando acessado pela raiz da barra inferior (`meus-anuncios.tsx`).
- [x] **T04 — Atualizar Testes de Componente e Integração**
  - Executar e atualizar `tests/components/myListingsView.test.tsx` com 16 testes cobrindo abas M3, estados e acessibilidade.
- [x] **T05 — Validação Visual via ADB e Suíte Completa**
  - Capturar screenshots no celular via ADB (`estante_pos3.png` e navegação funcional).
  - Executar `npm test` (162 arquivos e 1131 testes passando), `npm run check:architecture` e `npm run check:numbering`.
