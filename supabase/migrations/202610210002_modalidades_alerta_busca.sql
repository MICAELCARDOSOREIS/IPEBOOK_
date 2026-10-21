-- Spec 036: o alerta de busca passa a guardar as modalidades que interessam à pessoa.
-- Alertas existentes valem para as três, que é o comportamento anterior à coluna.

alter table public.v2_search_alerts
  add column if not exists modalities text[] not null default '{sale,trade,donation}';

alter table public.v2_search_alerts
  drop constraint if exists v2_search_alerts_modalities_check;

alter table public.v2_search_alerts
  add constraint v2_search_alerts_modalities_check check (
    cardinality(modalities) between 1 and 3
    and modalities <@ array['sale', 'trade', 'donation']::text[]
  );

-- O gatilho de correspondência passa a respeitar as modalidades do alerta (Spec 036, RN-02).
create or replace function public.v2_notify_search_alerts() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  select a.user_id, 'Livro encontrado para seu alerta',
    'Um novo anúncio corresponde a “' || a.query || '”.', 'search_alert_match', '/livro/' || new.id::text
  from public.v2_search_alerts a
  where a.active and a.user_id <> new.owner_id
    and new.modality = any (a.modalities)
    and (position(lower(a.query) in lower(new.title)) > 0
      or position(lower(a.query) in lower(new.author)) > 0
      or position(lower(a.query) in lower(coalesce(new.category, ''))) > 0);
  return new;
end;
$$;
revoke all on function public.v2_notify_search_alerts() from public, anon, authenticated;
