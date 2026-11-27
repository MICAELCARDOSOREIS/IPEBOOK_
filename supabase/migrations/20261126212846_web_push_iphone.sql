create table public.v2_web_push_subscriptions (
  endpoint text primary key check (
    length(endpoint) <= 2048 and endpoint ~ '^https://[a-z0-9-]+(\.[a-z0-9-]+)*\.push\.apple\.com/[^[:space:]]+$'
  ),
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{87}$'),
  auth_secret text not null check (auth_secret ~ '^[A-Za-z0-9_-]{22}$')
);

create index v2_web_push_subscriptions_user_idx on public.v2_web_push_subscriptions(user_id);
alter table public.v2_web_push_subscriptions enable row level security;
revoke all on public.v2_web_push_subscriptions from public, anon, authenticated;
grant select, insert, update, delete on public.v2_web_push_subscriptions to authenticated;
grant select, delete on public.v2_web_push_subscriptions to service_role;

create policy web_push_subscriptions_own on public.v2_web_push_subscriptions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
