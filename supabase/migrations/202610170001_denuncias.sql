-- Denúncias de anúncios desta versão (Spec 011);
-- Protegidas por RLS: apenas a pessoa autenticada pode criar denúncias em seu próprio nome
-- e visualizar as denúncias que ela mesma registrou.
create table public.v2_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.v2_books(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('inappropriate_content', 'fraud_or_scam', 'piracy_or_copyright', 'misleading_info', 'other')),
  details text check (details is null or (char_length(trim(details)) between 1 and 500)),
  created_at timestamptz not null default now()
);

create index v2_reports_listing_id_idx on public.v2_reports (listing_id);
create index v2_reports_reporter_id_idx on public.v2_reports (reporter_id);

alter table public.v2_reports enable row level security;

create policy "Conta registra a própria denúncia nesta versão" on public.v2_reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid()) and
    exists (
      select 1 from public.v2_books b
      where b.id = listing_id
    )
  );

create policy "Pessoa consulta as próprias denúncias nesta versão" on public.v2_reports
  for select to authenticated using (
    reporter_id = (select auth.uid())
  );

grant select, insert on public.v2_reports to authenticated;
