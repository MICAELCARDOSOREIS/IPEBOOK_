-- Preferências privadas do perfil: telefone/WhatsApp e bairro padrão (Spec 034 / Issue #141)
--
-- Vivem numa tabela separada de `v2_profiles` porque `v2_profiles` tem política de leitura
-- pública ("qualquer usuário autenticado lê perfis públicos") — telefone e bairro são dados
-- pessoais que só a própria pessoa deve poder ler.

create table if not exists public.v2_user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  neighborhood text,
  updated_at timestamptz not null default now()
);

comment on table public.v2_user_preferences is 'Preferências privadas de cada usuário: telefone/WhatsApp de contato e bairro padrão.';
comment on column public.v2_user_preferences.phone is 'Telefone/WhatsApp de contato, opcional. Nunca exposto no perfil público.';
comment on column public.v2_user_preferences.neighborhood is 'Bairro padrão em Piripiri, PI, opcional.';

alter table public.v2_user_preferences enable row level security;

create policy "usuário lê apenas as próprias preferências"
  on public.v2_user_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "usuário cria apenas as próprias preferências"
  on public.v2_user_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "usuário atualiza apenas as próprias preferências"
  on public.v2_user_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
