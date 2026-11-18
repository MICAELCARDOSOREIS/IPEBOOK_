# Tarefas — Spec 139 (Remoção do Tema Escuro)

- [x] T001 Criar ADR 0114 e artefatos da Spec 139 (`spec.md`, `plan.md`, `tasks.md`).
- [x] T002 Atualizar testes de tokens, contraste, container e componentes para refletir o contrato sem tema escuro (TDD Red).
- [x] T003 Remover `darkColors`, simplificar `ThemeProvider`/`useTheme`/`categoryTone`, fixar `userInterfaceStyle: "light"` no `app.json` e remover ramificações `resolvedScheme` nas views.
- [x] T004 Remover arquivos de entidade, datasources, usecases, viewmodel e registros no container DI referentes à preferência de tema, junto com seus testes dedicados.
- [x] T005 Atualizar documentação (`docs/adr/`, `docs/design-system.md`, `docs/estado.md`, `README.md`) e executar `npm run validate`.
