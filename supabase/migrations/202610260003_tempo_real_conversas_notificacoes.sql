-- Spec 086: conversas e notificações em tempo real.
-- O Supabase Realtime só emite postgres_changes de tabelas na publicação supabase_realtime;
-- sem isso a assinatura do chat nunca recebia mensagens novas. A RLS de cada tabela continua
-- valendo para quem assina, então cada pessoa só recebe o que já pode ler.
do $$
declare
  tabela text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach tabela in array array['v2_negotiation_messages', 'v2_notifications', 'v2_book_requests'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tabela
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tabela);
    end if;
  end loop;
end
$$;
