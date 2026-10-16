# 0015 — Gerar avisos de busca ao publicar anúncios

Data: 2026-10-15. Status: aceito.

## Contexto

A [spec 016](../../specs/016-favoritos-e-alertas-de-busca/spec.md) exige avisar leitores quando um anúncio novo corresponde a um alerta ativo. Os alertas pertencem a contas diferentes e não podem ser expostos ao cliente que publica o anúncio. A publicação e o aviso também precisam ter resultado consistente.

## Decisão

No Supabase, um trigger `after insert` em `v2_books` compara título, autor e categoria com alertas ativos e cria as notificações na mesma transação. A função usa `security definer` com `search_path` fixo e sem permissão de execução direta para clientes. RLS limita a leitura e gestão dos alertas à própria conta. No modo em memória, o datasource de alertas reproduz o mesmo comportamento para desenvolvimento e testes.

## Alternativas consideradas

- Listar alertas de todas as contas no aplicativo: rejeitada por expor buscas privadas.
- Chamar um serviço remoto depois de publicar: exigiria uma operação adicional e permitiria anúncio criado sem aviso correspondente.

## Consequências

- A migração `202610150003_favoritos_alertas.sql` precisa ser aplicada antes de ativar a funcionalidade no Supabase.
- O aviso é gerado apenas para anúncios novos; editar um anúncio antigo não dispara nova comparação.
- A comparação é textual, sem distância geográfica ou notificação push.

Vínculos: [spec 016](../../specs/016-favoritos-e-alertas-de-busca/spec.md), [ADR 0012](0012-supabase-com-rls.md).
