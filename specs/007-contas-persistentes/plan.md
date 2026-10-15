# Plano técnico — contas persistentes

- Criar migrações versionadas para anúncios e pedidos desta versão, em tabelas `v2_`; ativar
  RLS e políticas por proprietário. A coluna de proprietário referencia `auth.users` e é
  validada pelo banco. Perfis ficam para a entrega de perfil e idade.
- Encapsular Supabase Auth e PostgREST em `src/infra`, mantendo `model` e `usecase` independentes do SDK. A seleção de implementações ocorre somente em `src/di/container.ts`.
- Usar armazenamento de sessão compatível com Android e Web. Não persistir senha na aplicação. Recuperação usa link de uso único do Supabase e rota de definição de nova senha.
- Em produção exigir URL e chave publicável; em testes injetar implementações em memória. Não conectar a banco remoto no pipeline de testes unitários.
- Registrar a simulação e o resultado da migração no projeto compartilhado, conferir RLS e
  configurar e-mail transacional. Como as migrações só criam tabelas novas e não alteram
  registros legados, a recuperação consiste em desativar o backend desta versão e corrigir
  as tabelas `v2_` por nova migração; não executar reset do banco compartilhado.
- O usuário escolheu reutilizar o projeto Supabase já vinculado à CLI. Trazer as quatro migrações
  remotas para o histórico local e criar tabelas `v2_` próprias para esta versão. Conferir o
  plano com `supabase db push --dry-run --skip-vault` antes de aplicar. Não apagar tabelas nem
  registros legados, pois não há conflito que exija exclusão.

Decisão arquitetural: [ADR 0012](../../docs/adr/0012-supabase-com-rls.md).
