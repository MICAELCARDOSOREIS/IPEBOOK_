# Plano de Implementação — Spec 031 (Alinhamento Complementar das Telas do Micael ao Figma)

## Contexto Arquitetural

- **Camada afetada:** Estritamente `src/view/` (Camada 2 — View/UI) e `tests/components/` + `tests/components-mocked/`.
- **Dependências permitidas:** `src/view/` consome apenas `src/viewmodel/`, `src/model/` e `src/view/tokens.ts` + `src/view/components/*`, respeitando `npm run check:architecture`.
- **Isolamento de equipe:** Nenhum arquivo de `pessoa:maria-clara` será tocado.

## Estratégia por Grupo de Telas

1. **Descoberta — Alertas de Busca (`src/view/search/searchAlerts.tsx`):**
   - Envolver o conteúdo em container centralizado (`maxWidth: 720, width: "100%", alignSelf: "center"`).
   - Substituir tipografia e espaçamentos literais por `tokens.typography.*` e `tokens.spacing.*`.
   - Aplicar `tokens.typography.displayLarge.fontFamily` nos títulos e `tokens.colors.m3.surfaceContainerLow` nos cartões de alerta, preservando `aria-describedby` e `accessibilityHint` do campo de termo.
2. **Conta e Privacidade (`src/view/auth/deleteAccount.tsx` e `src/view/legal/termsAndPrivacy.tsx`):**
   - Em `deleteAccount.tsx`: substituir o checkbox manual por `Checkbox`, o botão manual de exportação JSON por `OutlinedButton`, e os emojis por `IconBadge`, usando `tokens.typography` e `tokens.spacing`.
   - Em `termsAndPrivacy.tsx`: envolver as seções em `ScrollView`, alinhar `styles.tabs` ao padrão Primary Tabs M3 (borda inferior `tokens.colors.action` como em `favorites.tsx`) e eliminar `#FFFFFF` e literais.
3. **Publicação e Moderação (`src/view/listings/myListings.tsx` e `src/view/listings/reportListing.tsx`):**
   - Em `myListings.tsx`: usar `Tag` para modalidade e status (`available`, `paused`, `reserved`), exibir conservação (`BOOK_CONDITION_LABELS`) e bairro no subtítulo do livro (`BookRow`), aplicar `fontFamily.brand` no título do livro e eliminar literais.
   - Em `reportListing.tsx`: estruturar motivos com `accessibilityRole="radiogroup"` e `accessibilityRole="radio"` (`accessibilityState={{ selected }}`), mantendo `accessibilityLabel={r.label}`, usar `IconBadge` nos cartões de estado e `tokens.typography`.
4. **Notificações, Pedidos e Ajuda (`notifications.tsx`, `requestListLayout.tsx`, `receivedRequests.tsx`, `sentRequests.tsx`, `requestDetail.tsx`, `helpAndFaq.tsx`, `welcome.tsx`):**
   - Em `notifications.tsx`: adicionar `maxWidth: 720, width: "100%", alignSelf: "center"`, trocar `#F7FAF8` por `tokens.colors.soft`, usar `IconBadge` nos cartões e estado vazio, e usar `tokens.typography`.
   - Em `requestListLayout.tsx`: exibir `BookCover` (`variant="list"`) e `Tag` de modalidade no card de cada pedido, usar `fontFamily.brand` no título do livro e tokens M3.
   - Em `requestDetail.tsx`: envolver em `ScrollView`, usar `Tag` de modalidade e `IconBadge` no banner de negociação aceita e seção de encontro seguro, e remover literais.
   - Em `helpAndFaq.tsx`: envolver em `ScrollView`, usar `fontFamily.brand` no título `"Dúvidas frequentes"` e tokens M3 nos cartões.
   - Em `welcome.tsx`: adicionar `maxWidth: 560, width: "100%", alignSelf: "center"` no `content` para alinhar ao Figma Web (`146:457`) e usar `OutlinedButton` e `TextButton`.

## Verificação

- Executar `npm test` para validar todos os testes de componentes e integração.
- Executar `npm run verify:release` (arquitetura, migrações, testes com cobertura > 80% e `expo export --platform web`).
- Publicar `dist/` atualizado no Cloudflare Pages (`https://ipebook.pages.dev`).
