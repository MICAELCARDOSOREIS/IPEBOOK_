# Tarefas — Spec 127 (Reativar os avisos do celular de dentro do app)

Dependem da Spec 020 (prompt explicativo) e do ADR 0098 (injeção pela View, ViewModel sem `@/di`).
Nenhuma tarefa muda quando o aviso aparece sozinho, o texto dos diálogos ou a regra de não insistir
depois da recusa.

- [x] **T001** `reopen()` em `src/viewmodel/usePermissionPromptViewModel.ts`: escreve `status: "explain"`
  sem ler nem gravar o registro de pergunta, entra na lista de ações memoizadas. CA3/CA4.
  Verificação: caso "Spec 127" em `tests/hooks/usePermissionPromptViewModel.test.tsx` (com `resolve()`
  já respondendo "asked", `reopen()` mostra a explicação, `request()` continua zero até o "Permitir avisos",
  e `refresh()` segue devolvendo `idle`).
- [x] **T002** Central de notificações com o controle: `src/view/notifications/notifications.tsx` monta
  `makeNotificationsPromptViewModel()` (View chamando a fábrica do contêiner, como já faz com
  `makeNotificationsViewModel`), adiciona `OutlinedButton` "Pedir permissão de novo" dentro da banner
  `testID="permission-alert"` e renderiza `PermissionPromptDialog` ao final da tela. A banner só aparece
  com a permissão desativada **e** sem concessão registrada no próprio aviso. CA1/CA2/CA6.
  Verificação: `tests/components-mocked/notificationsPermissionReopen.test.tsx` (4 casos).
- [x] **T003** A raiz volta a valer-se da permissão ao navegar: `src/view/components/PushRegistration.tsx`
  inclui `pathname` nas dependências do efeito que chama `promptActions.refresh()`, então conceder pela
  Central de notificações libera `permissionReady` do registro do token na mesma execução. CA5.
  Verificação: caso "Spec 127" em `tests/components/pushRegistration.test.tsx`, com o mock de
  `usePushRegistration` registrando o argumento de permissão.
- [x] **T004** Documentar e validar: `validacao.md` desta spec, Spec 020 (a pendência de UX que ela
  registrou como acompanhamento agora tem entrega própria), crônica e métricas em `docs/estado.md` e
  `README.md`. Verificação: `npm run validate` completo (inclusive `check:docs`) e os suítes tocados.
