# 0013 — Reset do esquema legado no projeto Supabase compartilhado

Data: 2026-10-15. Status: aceito. Substitui parcialmente o [0012](0012-supabase-com-rls.md).

## Contexto

A ADR 0012 decidiu preservar o esquema e os dados legados do único projeto Supabase disponível
(`listings`, `profiles`, `book_requests`, `notifications`, `favorites`, `ratings`, `reports`,
`request_messages`, `user_blocks`, de outra versão/equipe do IpeBook), isolando as tabelas novas
sob o prefixo `v2_`. Ao continuar a implementação, foi constatado que esse esquema legado tinha
dados reais (9 anúncios, 6 perfis, 4 pedidos, entre outros) e 15 funções `SECURITY DEFINER`
expostas via API, sem relação com o código desta branch. Não há ferramenta disponível para criar
ou apagar um projeto Supabase isolado a partir deste ambiente.

## Decisão

O usuário, informado do volume e da natureza dos dados existentes, autorizou explicitamente
apagar todo o esquema `public` legado (tabelas e funções) e recriar, no mesmo projeto, apenas as
tabelas da spec 007 (`v2_books`, `v2_book_requests`). A operação foi executada via MCP do
Supabase (`apply_migration`/`execute_sql`), sem acesso de CLI local. As quatro migrações locais
que apenas espelhavam o esquema legado (`notificacoes`, `favoritos`,
`conversar_antes_do_encontro`, `mapa_pontos_encontro`) foram removidas do repositório por não
corresponderem mais a nada no projeto.

## Alternativas consideradas

- Manter o isolamento por prefixo `v2_` da ADR 0012: rejeitado porque o usuário preferiu partir
  de um esquema limpo em vez de conviver com dados e funções de outra versão sem uso conhecido.
- Criar um projeto Supabase novo e isolado: preferível em princípio, mas sem ferramenta
  disponível neste ambiente para criar ou apagar projetos; exigiria ação manual do usuário no
  painel do Supabase e atualização de `.env` com nova URL/chave.

## Consequências

Os dados legados (anúncios, perfis, pedidos, avaliações, denúncias, bloqueios, notificações e
favoritos de outra versão do IpeBook) foram apagados de forma irreversível, com autorização
explícita. O projeto Supabase agora contém só o esquema desta spec. O advisor de segurança do
Supabase deixou de reportar as 15 funções `SECURITY DEFINER` legadas; resta o aviso padrão de
proteção contra senha vazada, não tratado por esta ADR. Qualquer equipe que dependesse do
esquema legado precisa ser avisada antes de reutilizar este projeto.

Vínculo: [spec 007](../../specs/007-contas-persistentes/spec.md), [registro de validação](../../specs/007-contas-persistentes/validacao.md).
