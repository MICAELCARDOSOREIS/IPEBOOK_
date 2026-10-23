# Plano de Implementação — Spec 057 (Convidar amigos e compartilhar o aplicativo)

## Arquitetura e Camadas (MVVM)

1. **Camada de Casos de Uso (`usecase/`)**:
   - `ShareUseCases` (`src/usecase/shareUseCases.ts`):
     - Adicionar `buildInviteMessage()`: retorna o texto oficial do convite comunitário.
     - Adicionar `buildWhatsAppInviteUrl()`: codifica a mensagem no esquema `whatsapp://send?text=...`.
     - Atualizar contrato `IShareUseCases` em `src/usecase/iShareUseCases.ts`.

2. **Camada de ViewModel (`viewmodel/`)**:
   - `useInviteFriendsViewModel` (`src/viewmodel/useInviteFriendsViewModel.ts`):
     - Gerencia estados `copied` (booleano com reset após timeout), `loading` e `error`.
     - Ações: `shareToWhatsApp()`, `shareNative()`, `copyLink()`.
     - Injeta `shareUseCases` a partir do container `di/container.ts`.

3. **Camada de View (`view/`)**:
   - `InviteFriends` (`src/view/profile/inviteFriends.tsx`):
     - Cabeçalho `TopAppBar` com botão de voltar.
     - Ícone temático comunitário (`IconBadge`).
     - Título/Manchete: "Convide amigos para o IpêBook".
     - Subtítulo explicativo: "Quanto mais gente lendo e circulando livros em Piripiri, mais opções para todo mundo."
     - Card de prévia da mensagem de convite.
     - Botão `FilledButton`: "Convidar pelo WhatsApp".
     - Botão `OutlinedButton`: "Mais opções de compartilhamento".
     - Botão `TextButton`: "Copiar link".
     - Feedback acessível de cópia via `accessibilityLiveRegion`.
   - Atualizar `ProfileHub` (`src/view/profile/profileHub.tsx`):
     - Adicionar prop `onNavigateToInviteFriends?: () => void`.
     - Adicionar item no `menuItems`: "Convidar amigos" (ícone `"share"` ou similar).

4. **Camada de Aplicação (`app/`)**:
   - `src/app/perfil/convidar.tsx`: Rota estática Expo Router apontando para `InviteFriends`.
   - Conectar no menu de `src/app/perfil/index.tsx` (ou `src/app/perfil.tsx`).

5. **Testes**:
   - Unitário: `tests/unit/inviteShareUseCases.test.ts`.
   - Hook: `tests/hooks/useInviteFriendsViewModel.test.tsx`.
   - Componente: `tests/components/inviteFriendsView.test.tsx`.
