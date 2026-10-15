# 0012 — Supabase com autorização no banco

Data: 2026-10-15. Status: substituído parcialmente pelo [0013](0013-reset-esquema-legado-supabase.md) quanto à preservação do esquema legado.

## Contexto

Os dados de contas e anúncios estão em memória. Isso impede a sincronização entre Android e Web e não protege operações concorrentes ou dados de outras pessoas em um serviço público. A beta exige persistência e autorização independente da interface.

## Decisão

Usar Supabase Auth, PostgreSQL e Storage, com migrações versionadas e Row Level Security em todas as tabelas expostas. O cliente usa apenas URL e chave publicável; políticas e funções do banco validam a identidade da sessão. `src/infra` encapsula o SDK e `src/di/container.ts` seleciona as implementações. O projeto Supabase já contém uma versão anterior do IpeBook; esta versão usa tabelas `v2_` próprias e preserva o esquema e os dados legados.

## Alternativas consideradas

- Manter dados em memória: rejeitado porque se perdem ao reiniciar e não são compartilhados.
- Criar servidor próprio para autenticação e persistência: adiado por exigir operação adicional para a primeira beta.
- Substituir ou adaptar diretamente as tabelas legadas: rejeitado nesta entrega porque o banco
  contém anúncios e pedidos existentes, e seus contratos diferem dos casos de uso atuais.

## Consequências

O projeto precisa de testes de RLS com duas contas, migrações, e-mail transacional, backup e procedimento de restauração. A autenticação é compartilhada entre as duas versões, mas os anúncios e pedidos são separados. O ambiente público usará Supabase Pro antes da abertura para ter backups diários; esse gasto depende de autorização específica. O código e os testes locais não comprovam que uma migração foi aplicada ou que e-mails são entregues.

Vínculo: [spec 007](../../specs/007-contas-persistentes/spec.md).
