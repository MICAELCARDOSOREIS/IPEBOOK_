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

## Continuação — hub de preferências do dispositivo (ADR 0058, US4)

- [x] **T09**: Criar contrato `ILocalCacheDataSource` (`src/model/datasources/iLocalCacheDataSource.ts`), adaptadores AsyncStorage/Memória reutilizando `BOOKS_LIST_CACHE_KEY` exportada de `cachedBookDataSource.ts`, e `LocalCacheUseCases` com registro em `src/di/container.ts` (FR-012, ADR 0027).
- [x] **T10**: Criar `useSettingsViewModel` (`src/viewmodel/useSettingsViewModel.ts`) com estados `clearingCache`/`cacheCleared`/`cacheError` e mensagem amigável sem detalhes técnicos (FR-013).
- [x] **T11**: Expandir a tela Configurações (`src/view/profile/settings.tsx`) com as seções "Dados neste dispositivo" (botão `OutlinedButton` + regiões vivas de sucesso/erro) e "Sobre o IpêBook" (versão via `expo-constants` e atalhos condicionais), ligados na rota `src/app/perfil/configuracoes.tsx` (FR-014, FR-015, US4).
- [x] **T12**: Testes da continuação: `tests/unit/localCacheUseCases.test.ts`, `tests/unit/asyncStorageLocalCacheDataSource.test.ts`, `tests/hooks/useSettingsViewModel.test.tsx` e novos casos em `tests/components/settingsView.test.tsx`; mock/alias `expo-constants` no Vitest (`tests/mocks/expo-constants.ts`).

## Continuação — perfil curto, Configurações no topo (ADR 0060)

- [x] **T13**: Trocar a linha "Configurações" de Meu perfil por um botão de engrenagem no cabeçalho (`src/view/profile/profileHub.tsx`, rótulo "Abrir configurações", alvo de 48 dp, visível também para visitante) e remover as linhas movidas (FR-001, FR-017).
- [x] **T14**: Enxugar o contrato de `ProfileHubProps` (saiu Privacy/BlockedUsers/Terms/Help), atualizar `src/app/perfil.tsx` e receber Privacidade e Pessoas bloqueadas em `src/app/perfil/configuracoes.tsx`, renderizando a seção "Conta e dados" em `src/view/profile/settings.tsx` apenas com sessão (FR-016, US4).
- [x] **T15**: Testes da reorganização: engrenagem navegando, ausência das linhas movidas em Meu perfil, seção "Conta" sumindo para visitante e seção "Conta e dados" aparecendo só com sessão (`tests/components/profileHubView.test.tsx`, `tests/components/settingsView.test.tsx`).

## Rastreabilidade da validação final

As tarefas T06, T08 e T12 cobrem diretamente a tela, a persistência, os estados de limpeza,
o fallback do armazenamento e a acessibilidade. A coerência visual de tema fica limitada às
superfícies verificadas e aos componentes integrados ao `ThemeProvider`; a migração dos demais
componentes permanece uma evolução posterior documentada na ADR 0036.
