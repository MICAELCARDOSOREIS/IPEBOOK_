# Plano de Implementação — Spec 131: Design de erros visuais e auto-recuperação offline

## Arquitetura e Estratégia de Implementação

### 1. Componente `InlineErrorCard`
- Criar `src/view/components/InlineErrorCard.tsx`:
  - Recebe `message: string`, `style?: StyleProp<ViewStyle>`, `icon?: AppIconName`.
  - Exibe container com `colors.errorContainer`, borda `colors.error`, ícone `error`, texto com contraste legível e acessibilidade (`accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"`).
  - Usar no `src/view/conversations/chat.tsx` (para `sendError`), `src/view/components/FavoriteButton.tsx`, `src/view/listings/reportUser.tsx`, `src/view/requests/meetingCard.tsx`, `src/view/listings/manageListing.tsx`, `src/view/listings/ProposalSheet.tsx`, `src/view/beta/betaInviteScreen.tsx`, `src/view/auth/resetPassword.tsx`, `src/view/moderation/moderation.tsx` e `src/view/listings/createListingStep{1,2,3}.tsx`.

### 2. Refinamento de `ErrorState` e `OfflineState`
- Em `src/view/components/ErrorState.tsx`:
  - Reestruturar container com card centralizado, ícone com fundo circular suave, texto bem distribuído e botão com `tokens.accessibility.touchTarget`.
- Em `src/view/components/OfflineState.tsx`:
  - Reestruturar container com card centralizado e ícone suave.
  - Integrar `useNetworkStatus(dataSource)`.
  - Adicionar `useEffect` ouvindo `isOnline`: quando passar de `false` para `true`, chamar `onRetry()` automaticamente.

### 3. Diagnóstico de Rede em `src/infra/supabaseErrors.ts`
- Atualizar `toDomainError`:
  - Verificar se a mensagem de erro contém indício de falha de transporte (`Network request failed`, `Failed to fetch`, `network error`, `AbortError`, etc.).
  - Se positivo, retornar `new DataSourceError("Sem conexão com a internet. Verifique sua rede e tente novamente.")`.

### 4. Testes e Validação
- Teste unitário de `InlineErrorCard`.
- Teste de auto-recuperação do `OfflineState`.
- Teste do mapeador `supabaseErrors`.
- Validação completa com `npm run validate`.
