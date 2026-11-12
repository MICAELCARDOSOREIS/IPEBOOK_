-- Política pública de atualização nativa do aplicativo Android (Spec 128 / ADR 0099).
create table if not exists public.v2_app_version_policy (
  platform text primary key check (platform in ('android')),
  latest_version text not null check (latest_version ~ '^\d+\.\d+\.\d+$'),
  min_supported_version text not null check (min_supported_version ~ '^\d+\.\d+\.\d+$'),
  release_notes text check (release_notes is null or length(release_notes) <= 280),
  store_url text not null check (store_url ~ '^https://play\.google\.com/'),
  updated_at timestamptz not null default now()
);

alter table public.v2_app_version_policy enable row level security;
drop policy if exists "Política de versão pode ser lida publicamente" on public.v2_app_version_policy;
create policy "Política de versão pode ser lida publicamente"
  on public.v2_app_version_policy for select
  to anon, authenticated using (true);

grant select on public.v2_app_version_policy to anon, authenticated;
revoke insert, update, delete on public.v2_app_version_policy from anon, authenticated;

insert into public.v2_app_version_policy
  (platform, latest_version, min_supported_version, release_notes, store_url)
values
  ('android', '0.1.0', '0.1.0', null,
   'https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR')
on conflict (platform) do nothing;
