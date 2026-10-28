# Especificação 102 — Moderação de denúncias

Status: implementada e testada localmente; migração `202610290001_moderacao.sql` aguardando aplicação no Supabase remoto. ADR: [0078](../../docs/adr/0078-moderacao.md).

## Objetivo
Dar destino às denúncias de anúncios (Spec 011) e de pessoas (Spec 091): uma fila para moderadores decidirem, com pausa automática de anúncios muito denunciados.

## Escopo
- Tabelas `v2_moderators` e `v2_suspended_users`; colunas `status`/`resolved_at` nas denúncias e `moderation_hold` em `v2_books`.
- RPCs `v2_is_moderator`, `v2_moderation_queue`, `v2_moderation_resolve`, `v2_moderation_unsuspend`.
- Tela `/moderacao` e atalho "Moderação" em Configurações, visível só para moderadores.
- Fora do escopo: cadastrar moderadores pelo app (feito no SQL do Supabase), histórico de decisões e reativar suspensão pela tela.

## Regras de negócio
- **RN-01** Só moderadores veem a fila e decidem; o banco recusa os demais.
- **RN-02** A fila agrupa denúncias abertas por anúncio ou pessoa, com motivos, detalhes e contagem, das mais denunciadas para as menos.
- **RN-03** Três denúncias abertas de pessoas diferentes pausam o anúncio (`moderation_hold`) e avisam quem anunciou; o dono não reativa até a decisão.
- **RN-04** Arquivar encerra as denúncias e devolve ao ar o anúncio retido.
- **RN-05** Remover tira o anúncio do ar e avisa quem anunciou (os favoritos são avisados pela Spec 101).
- **RN-06** Suspender impede a conta de anunciar, pedir livros, mandar mensagens e reativar anúncios; pausa os anúncios disponíveis dela, encerra as denúncias e a avisa.
- **RN-07** Ninguém se torna moderador nem altera a retenção pelo app.

## Como cadastrar um moderador
No SQL do Supabase: `insert into public.v2_moderators (user_id) values ('<id da conta>');`

## Critérios de aceite e verificação
| # | Critério | Verificação |
|---|---|---|
| CA1 | RN-01, RN-07 | Cenário SQL (`verificar-migracoes.mjs`, Spec 102) |
| CA2 | RN-02 a RN-06 | Cenário SQL |
| CA3 | Regra de acesso e decisões no app | `tests/unit/moderationUseCases.test.ts`, `tests/unit/supabaseModerationDataSource.test.ts` |
| CA4 | Tela: fila, vazio, erro, confirmação de remover/suspender | `tests/hooks/useModerationViewModel.test.tsx`, `tests/components-mocked/moderationView.test.tsx` |
