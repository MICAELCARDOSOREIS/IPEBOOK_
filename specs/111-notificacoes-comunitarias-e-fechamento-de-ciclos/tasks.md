# Tarefas — Notificações Comunitárias e Fechamento de Ciclos

- Especificação: [Spec 111](spec.md)
- ADR: [0085](../../docs/adr/0085-notificacoes-comunitarias-e-fechamento-de-ciclos.md)

- [x] **T1 — Criar migração SQL `202610300002_notificacoes_comunitarias.sql`**
  - [x] Atualizar `complete_delivery` com notificações de avaliação para dono e solicitante.
  - [x] Criar gatilho de boas-vindas e dica de segurança em `v2_profiles`.
  - [x] Atualizar gatilho de favoritos para reativação de livro disponível.
  - [x] Atualizar RPC de moderação com feedback para quem denunciou.
- [x] **T2 — Atualizar cenários de teste SQL em `scripts/verificar-migracoes.mjs`**
  - [x] Testar notificação dupla na entrega por QR Code.
  - [x] Testar onboarding do perfil (boas-vindas e safety_tip).
  - [x] Testar notificação de reabertura de favorito.
  - [x] Testar feedback da denúncia ao denunciante.
  - [x] Executar script e validar aprovação 100%.
- [x] **T3 — Exibir aviso de permissões desativadas na interface de notificações**
  - [x] Verificar permissão do sistema no carregamento da tela via ViewModel.
  - [x] Exibir banner instrutivo com respeito ao design system e tema escuro.
- [x] **T4 — Atualizar documentação e estado do projeto**
