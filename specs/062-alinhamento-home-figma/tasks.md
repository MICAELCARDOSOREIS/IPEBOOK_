# Tarefas de Implementação — Spec 062 (Alinhamento Home Figma 02.01)

- [x] **Tarefa 1: Documentar Decisão Arquitetural (ADR 0045)**
  - Criar `docs/adr/0045-alinhamento-visual-home-figma.md`.
  - Atualizar índice em `docs/adr/README.md`.

- [x] **Tarefa 2: Refatoração da View Home (`src/view/home.tsx`)**
  - Implementar cabeçalho com seletor de bairro e sino de notificações.
  - Implementar manchete editorial serifada e subtítulo.
  - Integrar campo de busca e chips de modalidade.
  - Implementar seção "Perto de você" com carrossel horizontal de livros e "Ver todos".
  - Implementar card de destaque comunitário "Doações da semana".
  - Preservar estado de carregamento, erro, vazio e alternador de tema.

- [x] **Tarefa 3: Atualização e Validação dos Testes Unitários e de Componente**
  - Ajustar `tests/components/homeView.test.tsx` e `tests/components-mocked/homeViewMocked.test.tsx`.
  - Rodar suíte com `npm test`.

- [x] **Tarefa 4: Verificação de Arquitetura e Numeração**
  - Executar `npm run check:architecture` e `npm run check:numbering`.

- [x] **Tarefa 5: Captura e Validação no Aparelho Real via ADB**
  - Capturar screenshot da nova tela rodando no celular via ADB.
