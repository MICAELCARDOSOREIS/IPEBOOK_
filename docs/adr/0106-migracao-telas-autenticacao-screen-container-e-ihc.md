# 0106 — Migração das telas de autenticação para ScreenContainer e aprimoramentos de IHC e foco

- **Data:** 2026-11-10
- **Status:** Aceito
- **Issue:** [#217](https://github.com/clarinhamartins/ipebook/issues/217)
- **Spec:** [Spec 133](../../specs/133-migrar-telas-autenticacao-screen-container/spec.md)

## Contexto

As telas da trilha de autenticação e acesso (`src/view/auth/`) ainda utilizavam estruturas manuais com `SafeAreaView` e `ScrollView` combinadas com estilos de espaçamento locais. Esse encapsulamento direto gerava duplicação de lógica para tratamento de margens seguras e quebrava o padrão unificado introduzido pelo componente `ScreenContainer` do design system.

Além disso, do ponto de vista de IHC e acessibilidade digital (WCAG 2.1 AA / TalkBack):
1. O fluxo de preenchimento via teclado virtual não possuía encadeamento automático entre os campos ao pressionar a tecla de ação "Avançar" (`returnKeyType="next"`).
2. Mensagens de erro de formulário ainda eram renderizadas como textos soltos de cor de erro, em vez de utilizar o componente semântico padronizado `InlineErrorCard` (introduzido no ADR 0102).

## Decisão

1. **Adoção do componente `ScreenContainer` em todas as 6 telas de autenticação:**
   - `src/view/auth/signIn.tsx`
   - `src/view/auth/signUp.tsx`
   - `src/view/auth/forgotPassword.tsx`
   - `src/view/auth/resetPassword.tsx`
   - `src/view/auth/deleteAccount.tsx`
   - `src/view/auth/authCallback.tsx`
   - Eliminar importações diretas de `SafeAreaView` da biblioteca `react-native-safe-area-context` nessas telas.
   - Fixar `maxWidth={560}` como padrão canônico para formulários de autenticação, preservando o padding lateral de 16 dp (`tokens.spacing[16]`).

2. **Encadeamento de foco de teclado virtual em formulários:**
   - Adicionar a propriedade `inputRef?: React.Ref<TextInput>` no componente `TextField` para viabilizar transferência programática de foco via `.focus()`.
   - Em telas com múltiplos campos de formulário (`signIn`, `signUp`, `resetPassword`), vincular o evento `onSubmitEditing` do campo atual para focar o campo subsequente via sua respectiva referência, mantendo `returnKeyType="next"` nos campos intermediários e `returnKeyType="done"` com envio no campo final.

3. **Padronização de alertas de erro com `InlineErrorCard`:**
   - Substituir elementos de erro textuais soltos pelo componente `InlineErrorCard`, garantindo ícone de alerta, contraste de cores e propriedades semânticas acessíveis (`accessibilityRole="alert"` e `accessibilityLiveRegion="assertive"`).

## Consequências

- **Positivas:**
  - Padronização arquitetural das views com o Design System do IpêBook.
  - Eliminação de boilerplate e unificação de comportamento responsivo no mobile e na Web desktop.
  - Melhoria substancial na usabilidade ao digitar em dispositivos móveis, eliminando toques desnecessários para alternar entre campos de texto.
  - Alertas de erro consistentes e de alta legibilidade conforme WCAG 2.1 AA.
- **Negativas / Riscos Mitigados:**
  - Nenhuma regressão detectada: compatibilidade total preservada com a casca lateral `AuthShell` na Web e 100% dos testes mantidos verdes.
