-- Favoritos e alertas são privados por conta. O catálogo continua público.
alter table public.v2_books add column category text check (category is null or char_length(trim(category)) <= 60);
create table public.v2_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.v2_books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index v2_favorites_user_created_idx on public.v2_favorites (user_id, created_at desc);
alter table public.v2_favorites enable row level security;
create policy "Pessoa consulta seus favoritos" on public.v2_favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Pessoa cria seus favoritos" on public.v2_favorites
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Pessoa exclui seus favoritos" on public.v2_favorites
  for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, delete on public.v2_favorites to authenticated;

create table public.v2_search_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null check (char_length(trim(query)) between 2 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index v2_search_alerts_user_created_idx on public.v2_search_alerts (user_id, created_at desc);
alter table public.v2_search_alerts enable row level security;
create policy "Pessoa consulta seus alertas" on public.v2_search_alerts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Pessoa cria seus alertas" on public.v2_search_alerts
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Pessoa altera seus alertas" on public.v2_search_alerts
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Pessoa exclui seus alertas" on public.v2_search_alerts
  for delete to authenticated using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.v2_search_alerts to authenticated;

create table public.v2_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('request_received', 'request_accepted', 'safety_tip', 'system', 'search_alert_match')),
  read boolean not null default false,
  created_at timestamptz not null default now(),
  action_url text
);

create index v2_notifications_user_created_idx on public.v2_notifications (user_id, created_at desc);
alter table public.v2_notifications enable row level security;
create policy "Pessoa consulta suas notificacoes" on public.v2_notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Pessoa marca suas notificacoes" on public.v2_notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select on public.v2_notifications to authenticated;
grant update (read) on public.v2_notifications to authenticated;

-- SECURITY DEFINER permite consultar alertas de outras contas sem expô-los ao cliente.
create function public.v2_notify_search_alerts() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  select a.user_id, 'Livro encontrado para seu alerta',
    'Um novo anúncio corresponde a “' || a.query || '”.', 'search_alert_match', '/livro/' || new.id::text
  from public.v2_search_alerts a
  where a.active and a.user_id <> new.owner_id
    and (position(lower(a.query) in lower(new.title)) > 0
      or position(lower(a.query) in lower(new.author)) > 0
      or position(lower(a.query) in lower(coalesce(new.category, ''))) > 0);
  return new;
end;
$$;
revoke all on function public.v2_notify_search_alerts() from public, anon, authenticated;
create trigger v2_book_matches_alerts after insert on public.v2_books
  for each row execute function public.v2_notify_search_alerts();
