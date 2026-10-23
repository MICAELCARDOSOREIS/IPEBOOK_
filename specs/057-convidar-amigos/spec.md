# Spec 057 — Convidar amigos e compartilhar o aplicativo (Figma 08.02)

## Contexto e Objetivo

No ecossistema de circulação comunitária de livros físicos em Piripiri, o boca a boca e as recomendações pelo WhatsApp são o principal motor de crescimento da rede. O fluxo 08 do Figma prevê duas telas complementares de compartilhamento:
- `08.01 · Compartilhar livro` (implementado na Spec 050 para anúncios individuais).
- `08.02 · Convidar amigos` (compartilhamento geral do app e convite para a comunidade).

Esta especificação implementa a funcionalidade completa de convite de amigos, permitindo:
1. Convidar amigos diretamente pelo WhatsApp com mensagem acolhedora e formatada.
2. Compartilhar por outros aplicativos via menu nativo do sistema operacional (`Share.share`) ou Web Share API (`navigator.share`).
3. Copiar o link oficial da comunidade (`https://ipebook.pages.dev`) para a área de transferência com feedback visual e acessível.
4. Integrar o botão/menu "Convidar amigos" no Hub de Perfil (`ProfileHub`, nó `07.01`) e fornecer uma rota dedicada `/perfil/convidar`.

## Requisitos Funcionais

- **RF-01**: A mensagem de convite deve convidar a pessoa para a comunidade de livros de Piripiri:
  `"Oi! Estou usando o IpêBook para trocar, vender e doar livros aqui em Piripiri. Dá uma olhada e participa também: https://ipebook.pages.dev"`.
- **RF-02**: A ação "Convidar pelo WhatsApp" deve abrir o WhatsApp via URL scheme `whatsapp://send?text=...` quando o aplicativo estiver instalado (`Linking.canOpenURL`).
- **RF-03**: Quando o WhatsApp não estiver disponível, deve acionar o compartilhamento nativo do sistema ou a Web Share API como fallback automático.
- **RF-04**: A ação "Copiar link" deve copiar a URL oficial para a área de transferência e exibir confirmação visual ("Link copiado!").
- **RF-05**: A rota `/perfil/convidar` deve ser acessível e responsiva, com visual acolhedor contendo ilustração/ícone, manchete e botões de ação em destaque.
- **RF-06**: O menu de `ProfileHub` (`/perfil`) deve exibir a opção "Convidar amigos" com ícone e texto explicativo, direcionando para `/perfil/convidar`.

## Critérios de Aceite

- **CA-01**: Caso de uso `ShareUseCases` estendido com `buildInviteMessage()` e `buildWhatsAppInviteUrl()`.
- **CA-02**: ViewModel `useInviteFriendsViewModel` orquestrando as ações de compartilhamento no WhatsApp, compartilhamento nativo e cópia de link.
- **CA-03**: Tela `InviteFriends` implementada conforme tokens do design system em `src/view/profile/inviteFriends.tsx`.
- **CA-04**: Rota `/perfil/convidar` registrada em `src/app/perfil/convidar.tsx` e acessível pelo menu de `ProfileHub`.
- **CA-05**: Testes unitários do caso de uso, teste de hook do viewmodel e teste de componente da view cobrindo todas as ações e fallbacks.
- **CA-06**: `npm run validate` e `npm run build:web` passando com 100% de sucesso e zero violações arquiteturais.
