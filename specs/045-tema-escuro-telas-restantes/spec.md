# Spec 045 — Tema escuro: migração das telas e componentes restantes (Issue #189)

## Contexto

A Spec 044 (Issue #144, ADR 0036) entregou a infraestrutura completa de tema escuro e migrou a
Home e os componentes que ela usa diretamente, como fatia vertical inicial. Esta entrega continua
o trabalho registrado como acompanhamento na Issue #189: migrar o restante do app.

## Escopo

- Os 17 componentes restantes de `src/view/components/` (`AddPhotoCard`, `Avatar`, `Checkbox`,
  `Chip`, `Dialog`, `FilledButton`, `IconBadge`, `Logotipo`, `Manchete`, `OutlinedButton`,
  `SearchField`, `StepProgress`, `Tag`, `TextButton`, `TextField`, `TopAppBar`).
- As 26 telas restantes de `src/view/*`: `auth/` (deleteAccount, forgotPassword, resetPassword,
  signIn, signUp), `favorites/`, `help/`, `legal/`, `listings/` (bookDetail, createListing,
  editListing, manageListing, myListings, publicProfile, reportListing), `notifications/`,
  `onboarding/welcome`, `profile/` (profile, profileHub, receivedRatings, security), `requests/`
  (requestDetail, requestListLayout + os consumidores `receivedRequests`/`sentRequests`, que
  importam o `requestStyles` compartilhado) e `search/` (editAlert, manageAlert, search,
  searchAlerts).
- Padrão aplicado em todos: `StyleSheet.create` estático vira `createStyles(colors: ColorPalette)`,
  lido via `useTheme()` no topo do componente, igual ao padrão já estabelecido na Spec 044.

## Fora do escopo (exceções documentadas, sem mudança)

- `AppIcon.tsx`: o parâmetro `color` tem um valor padrão estático (`tokens.colors.text`), mas todo
  chamador do componente já passa `color` explicitamente — o padrão nunca é usado na prática.
- `BookCover.tsx`: a cor `cover.text` (texto sobre a capa ilustrativa) é idêntica nos dois temas em
  `design-system/tokens.json` — mantida como `tokens.colors.cover.text` fixo, sem necessidade de
  reatividade.
- `photoGallery.tsx`: a galeria em tela cheia usa fundo preto e texto branco fixos por design
  (visualizador de fotos), independente do tema do app — não usa `tokens.colors`.

## Critérios de aceite

- [x] Todos os componentes e telas migrados respeitam o tema escuro/claro ativo via `useTheme()`.
- [x] Nenhum arquivo de view fora de `src/view/theme/` e das exceções documentadas acima importa
      `tokens.colors` para cor de UI.
- [x] `npm run validate` passando (typecheck, arquitetura, SQL, cobertura).
- [x] Suíte de testes completa sem regressões.
