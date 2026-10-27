-- Spec 091: denúncia de pessoa (perfil público). As denúncias já existiam só por anúncio.
-- Mesma política de v2_reports: a pessoa registra e consulta apenas as próprias denúncias.
create table public.v2_user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('abusive_behavior', 'fraud_or_scam', 'fake_profile', 'other')),
  details text check (details is null or (char_length(trim(details)) between 1 and 500)),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id),
  unique (reporter_id, reported_user_id)
);

create index v2_user_reports_reported_idx on public.v2_user_reports (reported_user_id);

alter table public.v2_user_reports enable row level security;

create policy v2_user_reports_insert on public.v2_user_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy v2_user_reports_select on public.v2_user_reports
  for select to authenticated
  using (reporter_id = (select auth.uid()));

revoke all on public.v2_user_reports from anon, public;
grant select, insert on public.v2_user_reports to authenticated;
