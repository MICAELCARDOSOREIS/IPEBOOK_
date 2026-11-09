# 0102. Padronização visual de erros no front-end, auto-recuperação do OfflineState e tratamento semântico de rede

- **Status:** Aceito
- **Data:** 2026-11-09
- **Contexto:** Design System / IHC / Feedback visual / Acessibilidade / Resiliência offline
- **Especificação:** [131](../../specs/131-design-de-erros-e-auto-recuperacao-offline/spec.md)

## Contexto

Uma auditoria visual e de usabilidade revelou duas fragilidades na experiência do usuário do IpêBook:
1. **Apresentação visual crua e destoante de erros no front-end**: mensagens de erro de submissão e validação eram exibidas como textos vermelhos soltos na tela (`styles.errorText`), sem card contenedor, sem respiro, sem ícone e sem harmonia com a paleta de cores acolhedora do aplicativo (papel pólen, café e verde botânico). No componente `FavoriteButton`, a mensagem de erro era renderizada em tamanho minúsculo (10px) em posição absoluta que quebrava a grade de alinhamento. Além disso, `ErrorState` e `OfflineState` apresentavam alinhamento árido à esquerda, desprovidos de um enquadramento tipo cartão que valorizasse a interface.
2. **Offline passivo e mensagens técnicas de rede**: quando a conexão de rede caía, a tela entrava em `OfflineState` e permanecia estática mesmo após o sinal 4G/Wi-Fi retornar, obrigando a pessoa a identificar a volta da rede e tocar manualmente no botão de tentar novamente. Paralelamente, erros de queda de sinal no Supabase eram engolidos como `DataSourceError` genéricos (*"Erro ao carregar"*), impedindo que o leitor compreendesse se o problema era do servidor ou de sua operadora móvel.

## Decisão

1. **Card padronizado para erros inline (`InlineErrorCard`):**
   - Criar `src/view/components/InlineErrorCard.tsx`, aplicando os tokens canônicos do Material 3 Expressive (`colors.errorContainer`, borda sutil, ícone `error` integrado, cantos arredondados `tokens.radius.medium` e tipografia `labelMedium`/`bodyMedium`).
   - Substituir mensagens de erro soltas em formulários centrais (chat, favoritos, propostas e criação de anúncio) pelo `InlineErrorCard`, garantindo acessibilidade (`accessibilityRole="alert"`, `accessibilityLiveRegion="polite"`).
2. **Refinamento estético de `ErrorState` e `OfflineState`:**
   - Envolver o estado de erro e offline em um cartão aconchegante centralizado, com espaçamento equilibrado, ícone destacado em círculo suave e botão de ação primária bem dimensionado (mínimo de 48 dp).
3. **Auto-recuperação ao reconectar no `OfflineState`:**
   - Integrar o `useNetworkStatus` no `OfflineState`. Ao detectar a transição de desconectado para conectado (`isOnline: false -> true`), disparar automaticamente `onRetry()`, recuperando a tela sem atrito para o usuário.
4. **Tratamento semântico de erros de conectividade no `supabaseErrors.ts`:**
   - Detectar falhas de transporte HTTP (`Network request failed`, `Failed to fetch`, `AbortError`) e traduzi-las em mensagens educativas e amigáveis em português.

## Consequências

- **Positivas:** Erros deixam de parecer quebras do sistema e passam a integrar harmonicamente a identidade visual; telas offline recarregam sozinhas assim que a pessoa recupera o sinal móvel; leitores de tela recebem regiões vivas consistentes.
- **Negativas / Mitigações:** O auto-reload imediato pode disparar uma requisição em rede ainda instável; mitiga-se com debounce natural do datasource e preservação do botão manual caso a rede volte a oscilar.
