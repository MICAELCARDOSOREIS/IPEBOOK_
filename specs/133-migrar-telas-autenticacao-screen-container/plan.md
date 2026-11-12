# Plano de Implementação — Spec 133: Migração de Telas de Autenticação para ScreenContainer

## 1. Contexto e Objetivos

Eliminar a divergência no envelopamento das telas de autenticação que ainda usavam `SafeAreaView` e `ScrollView` manuais, reduzindo duplicação de layout e garantindo suporte consistente a acessibilidade, foco de teclado virtual e exibição padronizada de erros.

## 2. Etapas de Execução

1. **Aprimoramento de TextField:**
   - Adicionar propriedade `inputRef?: React.Ref<TextInput>` ao componente `TextField` para viabilizar transferência programática de foco entre campos (`inputRef.current?.focus()`).

2. **Migração de signIn.tsx:**
   - Substituir `SafeAreaView` e `ScrollView` por `ScreenContainer maxWidth={560}`.
   - Configurar `ref` no campo de senha e chamar foco a partir do campo de e-mail ao acionar `onSubmitEditing`.
   - Adotar `InlineErrorCard` para exibição de erros de autenticação.

3. **Migração de signUp.tsx:**
   - Substituir `SafeAreaView` e `ScrollView` por `ScreenContainer maxWidth={560}`.
   - Configurar refs para encadeamento Nome -> E-mail -> Senha.
   - Adotar `InlineErrorCard` para mensagens de erro da ViewModel.

4. **Migração de forgotPassword.tsx:**
   - Substituir `SafeAreaView` e `ScrollView` por `ScreenContainer maxWidth={560}`.
   - Adotar `InlineErrorCard` para erros de validação e de envio de link.

5. **Migração de resetPassword.tsx:**
   - Substituir `SafeAreaView` e `ScrollView` por `ScreenContainer maxWidth={560}`.
   - Configurar encadeamento de foco de Nova Senha para Confirmar Senha.

6. **Migração de deleteAccount.tsx:**
   - Migrar retornos condicionais e principal para `ScreenContainer maxWidth={560}` (com responsividade web).
   - Adotar `InlineErrorCard` para `error` e `exportError`.

7. **Migração de authCallback.tsx:**
   - Migrar o contêiner para `ScreenContainer maxWidth={560} scroll={false}`.
   - Adotar `InlineErrorCard` para `errorMessage`.

8. **Testes e Validação:**
   - Atualizar e enriquecer os testes em `tests/components/authViews.test.tsx` e criar novos testes específicos de foco e ScreenContainer.
   - Executar validação estrita (`npm run validate`).
