# Plano de Implementação — Notificações Comunitárias e Fechamento de Ciclos

- Especificação: [Spec 111](spec.md)
- ADR: [0085](../../docs/adr/0085-notificacoes-comunitarias-e-fechamento-de-ciclos.md)

## Fase 1 — Banco de Dados e Migração SQL
1. Criar a migração `supabase/migrations/202610300002_notificacoes_comunitarias.sql`:
   - Atualizar `complete_delivery` para inserir notificações para o dono e o solicitante.
   - Criar gatilho `v2_profile_onboarding_notifications` em `v2_profiles` para inserir `system` (boas-vindas) e `safety_tip` (Pontos Seguros).
   - Atualizar `v2_notify_favorite_change` para tratar retorno de `reserved`/`paused` para `available`.
   - Atualizar `v2_moderation_resolve` para notificar autores das denúncias ao resolver.
2. Adicionar os cenários de teste correspondentes no script de verificação `scripts/verificar-migracoes.mjs`.
3. Executar `node scripts/verificar-migracoes.mjs` para garantir integridade e ausência de regressões em PGlite.

## Fase 2 — Aplicativo e Interface
1. Na tela de notificações (`src/view/notifications/notifications.tsx`), verificar o status de permissão via `pushNotificationService.getPermissions()`.
2. Se a permissão estiver desativada no aparelho, exibir banner acessível e sutil sugerindo a ativação.
3. Garantir cobertura de testes para a tela e os cenários de permissão.

## Fase 3 — Verificação e Auditoria
1. Conferir compatibilidade com `enviar-push` e canais de notificação (`messages`, `reminders`, `updates`).
2. Atualizar documentação de estado (`docs/estado.md`).
