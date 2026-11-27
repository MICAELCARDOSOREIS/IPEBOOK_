-- Tempo real completo para encontros e entregas por QR code.
-- Complementa 202610260003_tempo_real_conversas_notificacoes.sql para que aceitar/reagendar/cancelar
-- um encontro (`v2_meetings`) e concluir a entrega (`v2_deliveries`) atualizem instantaneamente
-- no Chat, em Acompanhar Encontro, na Estante e no Histórico de Encontros sem sair e entrar.
do $$
declare
  tabela text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach tabela in array array['v2_meetings', 'v2_deliveries'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tabela
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tabela);
    end if;
  end loop;
end
$$;

-- Garante que UPDATEs filtrados por `request_id` ou `id` no Realtime sempre contenham todas as colunas.
alter table public.v2_meetings replica identity full;
alter table public.v2_book_requests replica identity full;
alter table public.v2_deliveries replica identity full;
