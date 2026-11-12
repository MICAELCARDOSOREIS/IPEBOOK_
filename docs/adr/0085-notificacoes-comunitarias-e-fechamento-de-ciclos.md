# 0085 — Notificações comunitárias e fechamento de ciclos de interação

- Data: 2026-10-30
- Status: aceito
- Especificação: [111](../../specs/111-notificacoes-comunitarias-e-fechamento-de-ciclos/spec.md)
- Contexto complementar: ADRs 0043, 0071, 0075, 0076, 0077, 0078

## Contexto
O IpêBook conta com entrega de avisos via banco de dados e push pelo Expo (ADRs 0071 e 0075), cobrindo propostas, chat, encontros presenciais, favoritos e avaliações. Entretanto, alguns ciclos vitais permaneciam incompletos:
1. **Pós-entrega**: ao confirmar a entrega do livro por QR Code, apenas o anunciante recebia confirmação; quem pegou o livro não recebia aviso de conclusão nem incentivo para avaliar o parceiro da negociação.
2. **Boas-vindas e Pontos Seguros**: a central de notificações do novo leitor começava vazia, e a categoria `safety_tip` (presente nos canais e preferências) nunca era emitida pelo banco.
3. **Reabertura de favoritos**: se uma negociação era cancelada ou um anúncio pausado voltava a ficar disponível (`status = 'available'`), quem havia favoritado o livro não era notificado da oportunidade.
4. **Transparência em denúncias**: usuários que colaboravam denunciando fraudes ou livros inadequados não recebiam retorno quando a moderação resolvia a denúncia.
5. **Permissões do SO bloqueadas**: se o leitor desativasse as notificações nas configurações do celular, não havia alerta in-app orientando a reativação.

## Decisão
1. **Lembrete de avaliação mútua pós-entrega na RPC `complete_delivery`**:
   - Notificar tanto o anunciante quanto o solicitante, convidando ambos a avaliar o encontro presencial e a negociação na rota `/negociacao/[id]`.
2. **Boas-vindas e Dica de Segurança inicial (`v2_profiles`)**:
   - Gatilho `AFTER INSERT` em `v2_profiles` que emite imediatamente:
     - Notificação `system` de boas-vindas com direcionamento para `/pesquisa`.
     - Notificação `safety_tip` orientando sobre o uso obrigatório dos Pontos Seguros de Piripiri (Praça da Bandeira, Estação Ferroviária, IFPI) com link para `/ajuda`.
3. **Notificação de favorito disponível novamente (`v2_notify_favorite_change`)**:
   - Ao transicionar de `reserved` ou `paused` para `available`, disparar `favorite_update` para os usuários que favoritaram o livro.
4. **Retorno de moderação aos denunciantes (`v2_moderation_resolve`)**:
   - Ao solucionar uma denúncia aberta (seja arquivando, removendo anúncio ou suspendendo conta), notificar os autores das denúncias com aviso `system` de agradecimento.
5. **Aviso In-App de permissões bloqueadas**:
   - Exibir na central de notificações um lembrete visual caso as notificações do sistema operacional estejam negadas, permitindo abrir as preferências do app.

## Consequências
- Aumento da taxa de avaliações mútuas, fortalecendo a confiança entre leitores de Piripiri.
- Novos usuários compreendem o funcionamento do app e as regras de segurança desde o primeiro minuto.
- Maior velocidade de circulação de livros cujo pedido inicial foi cancelado.
- Maior engajamento da comunidade na moderação participativa.
- A migração `202610300002_notificacoes_comunitarias.sql` precisa ser aplicada localmente e no Supabase remoto.
