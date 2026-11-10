# Plano de Implementação — Especificação 133

**Funcionalidade:** Migração das Telas de Autenticação para ScreenContainer e Aprimoramento de IHC  
**Responsável:** Maria Clara Almeida Martins (`pessoa:maria-clara`)  
**Data:** 2026-11-10  

## Arquitetura e Estratégia de Migração

A migração preserva estritamente o isolamento da arquitetura MVVM em 7 camadas do IpêBook:
- **Camada View (`src/view/auth/`):** Atualização dos componentes visuais para encapsulamento via `ScreenContainer`, configuração de `ref` para os componentes `TextField` (ou seu `TextInput` interno), e inclusão do `InlineErrorCard` para exibição de erros contextuais.
- **Camada ViewModel (`src/viewmodel/`):** Preservação dos contratos existentes de `useAuthViewModel` e `makeAuthViewModel` sem alterações de interface que possam quebrar a estabilidade das rotas em `src/app/`.

### Fases de Execução

1. **Fase 1: Preparação de Testes de Regressão e Linha de Base**
   - Criação de testes dedicados em `tests/components/authScreensContainer.test.tsx` verificando a presença de `ScreenContainer`, limites de largura de formulário (`maxWidth: 560`) e encadeamento de submissão do teclado.

2. **Fase 2: Migração das Telas de Entrada (`signIn.tsx` e `signUp.tsx`)**
   - Substituição de `SafeAreaView` e `ScrollView` manual por `<ScreenContainer maxWidth={560} ...>`.
   - Adição das referências de teclado e encadeamento de `onSubmitEditing`.
   - Integração do `InlineErrorCard` para falhas de autenticação e termos.

3. **Fase 3: Migração das Telas de Recuperação e Segurança (`forgotPassword.tsx`, `resetPassword.tsx`, `deleteAccount.tsx`)**
   - Migração para `ScreenContainer maxWidth={560}` com padding canônico e estilo harmonizado.
   - Aplicação do `InlineErrorCard` nas mensagens de erro de envio e de validação de confirmação de exclusão.

4. **Fase 4: Validação Integral e Qualidade**
   - Execução de `npm run check:architecture`, `npm run typecheck`, `npm run test` e `npm run validate`.
