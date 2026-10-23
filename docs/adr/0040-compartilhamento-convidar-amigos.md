# 40. Compartilhamento do aplicativo e convite de amigos (Figma 08.02)

- **Data:** 2026-10-23
- **Status:** Aceito
- **Contexto:**
  O Figma prevê no fluxo 08 duas ações de compartilhamento: `08.01 · Compartilhar livro` (já implementado na Spec 050) e `08.02 · Convidar amigos` / compartilhar o app.
  Na comunidade de Piripiri, o WhatsApp é o canal prioritário para adesão de novos leitores. Atualmente o hub de perfil (`ProfileHub`, rota `/perfil`) não oferece a opção de convidar amigos ou divulgar o IpêBook diretamente.

- **Decisão:**
  1. Expandir o caso de uso `ShareUseCases` com métodos dedicados para o convite da comunidade:
     - `buildInviteMessage()`: formata mensagem convidando para a comunidade de Piripiri com a URL oficial (`https://ipebook.pages.dev`).
     - `buildWhatsAppInviteUrl()`: gera URL de abertura direta com o esquema `whatsapp://send?text=...`.
  2. Implementar a ação `inviteFriendsToWhatsApp` e `inviteFriends` (fallback nativo ou Web Share API / cópia) no ViewModel de compartilhamento ou ViewModel dedicado.
  3. Adicionar o item "Convidar amigos" no menu de `ProfileHub` (`07.01`), conectando-o à tela ou modal de convite com opções dedicadas (WhatsApp e Outros apps / Copiar link).
  4. Adicionar a rota `/perfil/convidar` para acesso direto e navegação via Expo Router.

- **Consequências:**
  - Facilita o crescimento orgânico da comunidade local de leitores em Piripiri.
  - Mantém uniformidade de comportamento com o compartilhamento de anúncios (Spec 050) em mobile e web.
  - Zero novas dependências externas; aproveita as abstrações existentes de `Linking`, `Share` e `Clipboard`.
