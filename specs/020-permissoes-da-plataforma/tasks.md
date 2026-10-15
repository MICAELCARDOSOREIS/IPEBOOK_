# Tarefas: Permissões da Plataforma (Spec 020)

- [ ] T001 Conferir o que o fluxo de anunciar já usa para fotos (biblioteca, permissões) antes
  de planejar mudança — não assumir.
- [ ] T002 Criar lista fixa de bairros de Piripiri (`src/model/neighborhoods.ts`).
- [ ] T003 Criar `useNeighborhoodPickerViewModel` e a tela `src/app/bairro.tsx`.
- [ ] T004 Criar `usePermissionPromptViewModel` genérico (texto explicativo → pedir → tratar
  negado) e a view `permissionPrompt.tsx` parametrizada.
- [ ] T005 Integrar o prompt de permissão de notificações ao fluxo de cadastro/login.
- [ ] T006 Integrar o prompt de permissão de câmera/fotos ao fluxo de anunciar, com fallback
  pra capa ilustrativa quando negado.
- [ ] T007 Implementar testes unitários, de hooks e de componentes (cobertura > 80%).
- [ ] T008 Executar `npm run validate` e `npm run build:web`, registrar em `validacao.md`.
