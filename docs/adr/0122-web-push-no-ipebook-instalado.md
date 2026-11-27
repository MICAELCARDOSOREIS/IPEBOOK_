# ADR 0122 — Web Push no IpêBook instalado

- **Data** 2026-11-26
- **Status** Aceito
- **Relacionado** [Spec 136](../../specs/136-pwa-iphone-apple-hig/spec.md)

## Contexto

O PWA instalado pode receber avisos de propostas e encontros. A permissão do navegador sozinha não registra o dispositivo e um token Expo não representa uma inscrição Web Push.

## Decisão

Solicitar inscrição pelo botão da central no PWA instalado. Guardar as chaves por inscrição em uma tabela com RLS por conta e usar o webhook existente para enviar, com VAPID, avisos genéricos que abrem a central. Validar o domínio de destino antes de enviar e seguir as preferências por tipo. Desativar a inscrição deste dispositivo ao sair da conta.

## Consequências

A ativação exige chave pública no build, par VAPID no servidor e autenticação. A implantação deve incluir a migração antes de habilitar a opção. A aceitação em segundo plano requer instalação pela Tela de Início em iPhone com suporte a Web Push.

- [Como a Apple entrega notificações Web Push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)
