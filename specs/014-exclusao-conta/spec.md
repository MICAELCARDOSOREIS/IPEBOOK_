# Especificação 014: Exclusão de Conta e Direito ao Esquecimento (LGPD)

## 1. Contexto e Motivação
Em conformidade com o Artigo 18 da Lei Geral de Proteção de Dados (LGPD) e com as diretrizes obrigatórias de publicação da Apple App Store (Guideline 5.1.1(v)) e Google Play Store, todo aplicativo que permite a criação de conta deve fornecer um mecanismo direto, claro e seguro para que a pessoa usuária solicite a exclusão definitiva de sua conta e dos dados pessoais vinculados.

## 2. Escopo
- **Incluído:**
  - Método `deleteAccount(userId: string): Promise<void>` no contrato `IAuthDataSource` e implementações (`MemoryAuthDataSource` e `SupabaseAuthDataSource`).
  - Caso de uso `deleteAccount(sessionUserId: string | null)` em `IAuthUseCases` e `AuthUseCases` com validação de sessão e encerramento da sessão ativa.
  - ViewModel `useDeleteAccountViewModel` com estados de confirmação, carregamento, sucesso e erros de domínio.
  - View `DeleteAccount` e `DeleteAccountScreen` em `src/view/auth/deleteAccount.tsx` e `src/view/auth/deleteAccountScreen.tsx` com aviso claro das consequências (perda definitiva do histórico, cancelamento de anúncios ativos e encerramento de sessão) e botão de confirmação com dupla checagem.
  - Rota `src/app/excluir-conta.tsx`.
  - Atalho de acesso na aba de Privacidade da tela de Termos (`src/view/legal/termsAndPrivacy.tsx`).
  - Testes unitários, de hook e de componente.
- **Fora de escopo:**
  - Alterações no Perfil da Maria Clara (Issue #55).

## 3. Critérios de Aceite
1. **CA1 — Validação de sessão:** Apenas pessoas com sessão ativa podem acessar a tela de exclusão. Tentativas de acesso não autenticado redirecionam para login ou exibem aviso.
2. **CA2 — Confirmação explícita:** A tela exige confirmação explícita do usuário para evitar exclusões acidentais, detalhando as consequências irreversíveis.
3. **CA3 — Encerramento e remoção:** Ao confirmar, a conta é removida da base de dados, a sessão é finalizada e o usuário é redirecionado à Home com feedback de conta excluída.
4. **CA4 — Acessibilidade e Design System:** Segue os tokens e critérios de acessibilidade (WCAG 2.1 AA / ISO 25010), botões com touch target >= 48dp e alertas semânticos.
