# Plano: Configurações e tema do perfil

Branch: `develop` | Data: 2026-10-26 | Especificação: [spec.md](spec.md)

## Objetivo e arquitetura

Criar uma tela dedicada de **Configurações** acessível por Meu perfil, mover o seletor de aparência para lá, remover a duplicação do seletor no hub, e corrigir a integração do tema resolvido com a moldura do sistema (StatusBar e `userInterfaceStyle`). Segue o padrão existente: rota fina em `src/app/perfil/`, tela em `src/view/profile/`, navegação por callback, tema via `useTheme()`.

ADRs pertinentes: 0036 (tema escuro), 0058 (hub de preferências do dispositivo), 0060 (perfil
curto e Configurações como destino único), 0011 (navegação por barra inferior) e 0019
(componentes e MVVM).

## Contexto técnico

- Expo 58, React Native 0.88, TypeScript 6, Vitest 5.
- Persistência de tema via AsyncStorage (`ipebook.preferenciaDeTema`).
- ThemeProvider distribui cores via Context; `useThemeViewModel` resolve preferência + sistema.
- `expo-status-bar` já é dependência e plugin; a tela raiz deve sincronizá-lo com o tema resolvido.
- `app.json` deve declarar `"userInterfaceStyle": "automatic"` para acompanhar a preferência
  Sistema e o tema resolvido.

## Escopo final incorporado

Durante a implementação, o escopo foi ampliado pelos ADRs 0058 e 0060, sem criar uma nova
funcionalidade independente:

- a tela também reúne a limpeza do catálogo offline e a seção "Sobre o IpêBook";
- a limpeza reutiliza `BOOKS_LIST_CACHE_KEY` e expõe estados de carregamento, sucesso e erro;
- o perfil passou a ter uma entrada de configurações no cabeçalho, inclusive para visitantes;
- "Privacidade e dados", "Pessoas bloqueadas", Termos e Ajuda deixaram de ser duplicados no
  perfil e passaram a ser encaminhados conforme a sessão e a navegação fornecida.

## Conformidade com a constituição

| Princípio | Verificação |
|-----------|-------------|
| Português em documentação e UI | Rótulos, título e descrição em português. |
| MVVM com DI | Nenhuma lógica nova; reutiliza ThemePreferenceSelector e useTheme. |
| Domínio puro e TypeScript estrito | Sem novas entidades ou contratos; sem `any`. |
| Spec Kit obrigatório | Spec 073 criada antes da implementação. |
| ADRs | Sem decisão arquitetural nova; reutiliza ADR 0036. |
| Critérios verificáveis | Testes de componente + typecheck + validate. |
| Desenvolver em `develop` | Trabalho na branch develop. |

## Arquivos e sequência

### Passo 1 — Tela de Configurações

- **Criar** `src/view/profile/settings.tsx`: componente `Settings` com `TopAppBar` ("Configurações"), `ThemePreferenceSelector` em seção "Aparência", `SafeAreaView`, `ScrollView`, padrão `createStyles(colors)`.
- **Criar** `src/app/perfil/configuracoes.tsx`: rota fina que importa `Settings` e passa `onBack={() => router.back()}`.

### Passo 2 — Entrada no hub e remoção do seletor duplicado

- **Modificar** `src/view/profile/profileHub.tsx`:
  - Adicionar prop `onNavigateToSettings` (opcional).
  - Adicionar item "Configurações" na seção Conta (antes de "Termos e privacidade"), com ícone `settings` (ou `tune`, conforme disponibilidade no AppIcon), descrição "Aparência e preferências do aplicativo".
  - Remover `<ThemePreferenceSelector />` avulso e a importação correspondente.
- **Modificar** `src/app/perfil.tsx`: passar `onNavigateToSettings={() => router.push("/perfil/configuracoes")}`.

### Passo 3 — Coerência do tema com o sistema

- **Modificar** `app.json`: trocar `"userInterfaceStyle": "light"` por `"userInterfaceStyle": "automatic"`.
- **Modificar** `src/app/_layout.tsx`: importar `StatusBar` de `expo-status-bar` e renderizá-lo com `style="auto"` dentro do ThemeProvider, para que a barra de status acompanhe o tema resolvido.

### Passo 4 — Testes

- **Criar** `tests/components/settingsView.test.tsx`: renderiza Settings, verifica título "Configurações", presença do seletor de tema, acessibilidade do radiogroup.
- **Modificar** `tests/components/profileHubView.test.tsx`: ajustar expectativas — verificar item "Configurações" em vez do seletor de tema avulso; adicionar `onNavigateToSettings` no mock de props.

### Passo 5 — Validação

- `npm run typecheck`
- `npm run test -- tests/components/settingsView.test.tsx tests/components/profileHubView.test.tsx tests/components/themePreferenceSelector.test.tsx tests/unit/themePreferenceUseCases.test.ts`
- `npm run check:architecture`

## Validação

| Comando | Resultado esperado |
|---------|--------------------|
| `npm run typecheck` | Zero erros no repositório. A execução posterior confirmou que os erros de busca registrados durante o planejamento não persistem. |
| Testes de settings, profileHub, themeSelector, themeUseCases | Todos aprovados. |
| `npm run check:architecture` | Zero violações de importação. |

## Riscos e complexidade

- **Risco encerrado**: os 11 erros de TypeScript registrados durante o planejamento em `search.tsx` e
  `searchView.test.tsx` não estão presentes na validação atual (`npm run typecheck` aprovado).
- **Ícone `settings`**: verificar se `AppIcon` já possui esse nome; caso contrário, usar um ícone existente adequado (ex: `tune`).
- **Complexidade baixa**: reutiliza componentes e infraestrutura existentes, sem novas dependências ou camadas.
