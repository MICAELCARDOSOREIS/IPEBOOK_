-- Leitura pública de perfis e avaliações por visitantes deslogados (ADR 0038 / Pendência Spec 053)

drop policy if exists "qualquer usuário autenticado lê perfis públicos" on public.v2_profiles;

create policy "leitura pública de perfis comunitários"
  on public.v2_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "qualquer usuário autenticado lê avaliações" on public.v2_ratings;

create policy "leitura pública de avaliações comunitárias"
  on public.v2_ratings for select
  to anon, authenticated
  using (true);
