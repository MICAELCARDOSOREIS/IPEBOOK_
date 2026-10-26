# Tarefas — Spec 073 (Configurações e tema do perfil)

Branch: `develop` | Data: 2026-10-26 | Especificação: [spec.md](spec.md) | Plano: [plan.md](plan.md)

- [x] **T01**: Criar a tela dedicada de Configurações (`src/view/profile/settings.tsx`) com `TopAppBar` e seção "Aparência" contendo `ThemePreferenceSelector` (FR-002, FR-003, ADR 0036).
- [x] **T02**: Criar a rota de navegação `src/app/perfil/configuracoes.tsx` integrando a tela de configurações com `router.back()` (FR-002).
- [x] **T03**: Adicionar a entrada "Configurações" na seção Conta do `ProfileHub` (`src/view/profile/profileHub.tsx`) com ícone `settings`, rótulo acessível e prop `onNavigateToSettings`, removendo o seletor avulso duplicado de Meu perfil (FR-001, FR-009).
- [x] **T04**: Conectar a navegação para `/perfil/configuracoes` no roteador do perfil (`src/app/perfil.tsx`).
- [x] **T05**: Garantir coerência visual do tema com a moldura do sistema configurando `"userInterfaceStyle": "automatic"` em `app.json` e `<StatusBar style="auto" />` em `src/app/_layout.tsx` (FR-007, FR-008).
- [x] **T06**: Criar a suíte de testes de componente `tests/components/settingsView.test.tsx` validando renderização do título "Configurações", acionamento do botão voltar (`onBack`), presença da seção "Aparência" com radiogroup acessível e opções de tema (SC-001, SC-002, SC-003).
- [x] **T07**: Atualizar a suíte de testes `tests/components/profileHubView.test.tsx` para verificar o item "Configurações" (label e descrição) e a chamada de `onNavigateToSettings`.
- [x] **T08**: Executar as suítes de testes (`tests/components/profileHubView.test.tsx`, `tests/components/settingsView.test.tsx`, `tests/components/themePreferenceSelector.test.tsx`), verificar a tipagem (`npm run typecheck`) e a conformidade arquitetural (`npm run check:architecture`) (SC-006).
