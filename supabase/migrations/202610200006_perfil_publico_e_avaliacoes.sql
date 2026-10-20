-- Perfil público do anunciante e avaliações (Spec 018 / Issue #73)

create table if not exists public.v2_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Usuário',
  created_at timestamptz not null default now()
);

comment on table public.v2_profiles is 'Perfil público (somente leitura por terceiros) de cada usuário.';
comment on column public.v2_profiles.name is 'Nome exibido no perfil público; padrão até o fluxo de edição de perfil (#55/#56).';
comment on column public.v2_profiles.created_at is 'Data de entrada na comunidade, exibida no perfil público.';

alter table public.v2_profiles enable row level security;

create policy "qualquer usuário autenticado lê perfis públicos"
  on public.v2_profiles for select
  to authenticated
  using (true);

create policy "usuário cria/atualiza apenas o próprio perfil"
  on public.v2_profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "usuário atualiza apenas o próprio perfil"
  on public.v2_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create table if not exists public.v2_ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references auth.users (id) on delete cascade,
  rated_user_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid not null references public.v2_book_requests (id) on delete cascade,
  score smallint not null check (score >= 1 and score <= 5),
  created_at timestamptz not null default now(),
  unique (rater_id, request_id)
);

comment on table public.v2_ratings is 'Avaliações de 1 a 5 entre participantes de uma negociação concluída.';

alter table public.v2_ratings enable row level security;

create policy "qualquer usuário autenticado lê avaliações"
  on public.v2_ratings for select
  to authenticated
  using (true);

create policy "usuário só cria avaliação em seu próprio nome"
  on public.v2_ratings for insert
  to authenticated
  with check (auth.uid() = rater_id);

grant select on public.v2_profiles to anon, authenticated;
grant insert, update on public.v2_profiles to authenticated;
grant select on public.v2_ratings to anon, authenticated;
grant insert on public.v2_ratings to authenticated;
