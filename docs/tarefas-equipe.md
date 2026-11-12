# Tarefas para a equipe — participação real

> Cada tarefa abaixo é trabalho **genuíno e verificável**. Quem a assume commita no próprio nome,
> em uma branch `feat/...` derivada de `develop`, e abre PR para `develop` seguindo o
> `CONTRIBUTING.md`. Nada aqui é "commit fantasma" — é lacuna real do projeto hoje.
>
> **Antes de começar:** sincronize com `develop` (`git checkout develop && git pull origin develop`)
> e confira o estado atual do arquivo-alvo.

## Por que essas tarefas existem

O projeto ganhou o componente `ScreenContainer`
(`src/view/components/ScreenContainer.tsx`), que centraliza o padrão `SafeAreaView` + coluna
centralizada com `maxWidth` e padding lateral `space-4` (16 px). Várias telas ainda usam o bloco
manual (`SafeAreaView` + `ScrollView` + estilos `page`/`content` com `maxWidth` solto), o que é
inconsistente e propenso a erro. A migração é mecânica, segura e bem definida — ideal para
distribuir entre a equipe.

Padrão de referência já pronto: `src/view/home.tsx` e `src/view/onboarding/welcome.tsx` (ambas
já usam `ScreenContainer`). Leia essas duas antes de começar.

---

## Maria Clara Almeida Martins — @clarinhamartins

**Issue #217:** Migrar as telas de autenticação e acesso para o `ScreenContainer` e aprimorar a ergonomia de entrada (Spec 133 / ADR 0106).
* **Link no GitHub:** https://github.com/MICAELCARDOSOREIS/IPEBOOK_/issues/217
* **Branch de trabalho:** `feature/217-migrar-telas-autenticacao-screen-container` (a partir de `develop`)
* **Labels:** `pessoa:maria-clara`, `accessibility`, `enhancement`

> *Nota de histórico:* As telas de busca e alertas (`search.tsx`, `searchAlerts.tsx`, `manageAlert.tsx`, `editAlert.tsx`) já foram migradas com sucesso por Maria Clara no PR #215 (Issue #215). Esta nova issue foca no núcleo de autenticação e formulários.

Arquivos-alvo (verifique o estado atual antes de iniciar):

- `src/view/auth/signIn.tsx` — migrar para `ScreenContainer maxWidth={560}`, encadear foco de e-mail para senha via `ref` e adotar `InlineErrorCard`.
- `src/view/auth/signUp.tsx` — migrar para `ScreenContainer maxWidth={560}`, encadear foco consecutivo (Nome -> E-mail -> Senha) e adotar `InlineErrorCard`.
- `src/view/auth/forgotPassword.tsx` — migrar para `ScreenContainer maxWidth={560}`.
- `src/view/auth/resetPassword.tsx` — migrar para `ScreenContainer maxWidth={560}`.
- `src/view/auth/deleteAccount.tsx` — migrar retornos para `ScreenContainer maxWidth={560}`.
- `src/view/auth/authCallback.tsx` — migrar para `ScreenContainer maxWidth={560}`.

Critérios de aceite:

- Nenhuma tela-alvo usa mais `SafeAreaView` importado diretamente para o container de página (apenas `ScreenContainer`).
- `keyboardShouldPersistTaps="handled"` preservado para envio fluido de formulários com o teclado aberto.
- Mensagens de erro de formulário exibidas via `InlineErrorCard` com `accessibilityRole="alert"`.
- `npm run typecheck`, `npm run check:architecture` e `npm run test` passam.

Como verificar: `npm run validate` verde.

---

## Antonio Carlos Gomes — @gomes738

**Tarefa:** Migrar as telas de perfil, requisição e perfil público para o `ScreenContainer`.

Arquivos-alvo (verifique o estado atual — `profile.tsx` pode estar em migração):

- `src/view/profile/profile.tsx` — `maxWidth` 720, padding 24 → alinhar para `space-4` (16)
  via `ScreenContainer maxWidth={720}`
- `src/view/profile/profileHub.tsx` — conferir se tem container próprio e migrar
- `src/view/requests/requestDetail.tsx` — `maxWidth` 720 → `ScreenContainer maxWidth={720}`
- `src/view/requests/scheduleMeeting.tsx` — `maxWidth` 560 (formulário/foco) → `ScreenContainer maxWidth={560}`
- `src/view/listings/publicProfile.tsx` — `maxWidth` 720, usa `edges={["top","left","right"]}`
  → preservar as `edges` no `ScreenContainer`

Critérios de aceite:

- Mesmos do bloco da Maria Clara para os arquivos desta tarefa.
- O `paddingHorizontal` final de todas as telas migradas é `space-4` (16 px), padrão do design
  system (`design-system/03-fundamentos.md`). Se alguma tela tinha 24 px e a mudança altera o
  layout, registre a justificativa no PR.

Como verificar: `npm run validate` verde.

---

## Eric Vinícius dos Santos Oliveira — @Eric2025gh

**Tarefa 1 — Cobertura de testes do `ScreenContainer`.**

Hoje `src/view/components/ScreenContainer.tsx` não tem teste dedicado. Criar
`tests/components/screenContainer.test.tsx` cobrindo:

- Renderiza `children` dentro da coluna centralizada.
- Respeita `maxWidth` (variantes 720 e 560), `paddingHorizontal`, `paddingTop`, `paddingBottom`.
- `scroll={false}` renderiza um `View` em vez de `ScrollView`.
- `overlay` é renderizado como irmão do conteúdo (dentro do `SafeAreaView`).
- `edges` repassado ao `SafeAreaView`.
- Fundo da página é `colors.surface` do tema.

Critério de aceite: cobertura do componente ≥ 90%; `npm run test:coverage` verde.

**Tarefa 2 — Verificar acessibilidade da trava de orientação.**

Confirmar (em dispositivo/emulador Android) que o app permanece em retrato ao girar o aparelho,
e que a trava em runtime (`expo-screen-orientation` em `src/app/_layout.tsx`) não gera erro em
emuladores sem suporte (o `catch` ignora silenciosamente). Registrar o resultado (passou/falhou
+ ambiente) no PR.

---

## Notas

- A divisão acima é uma sugestão de distribuição; quem prefere trocar de bloco com um colega,
  combinem entre vocês — o que importa é cada tarefa ter um dono e ser commitada no nome de quem
  de fato a fez.
- Se surgir dúvida sobre o comportamento esperado de uma tela ao migrar, consulte a tela
  correspondente no Figma (links em `design-system/telas-android-figma.md`) e o
  `design-system/03-fundamentos.md`, seção "Orientação e layout responsivo".
- O responsável geral do design system (Micael) revisa mudanças de layout antes de integrar em
  `develop` (ver `design-system/README.md`, seção 7).
