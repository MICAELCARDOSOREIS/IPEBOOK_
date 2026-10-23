-- Bloqueio de usuários e moderação interpessoal (Spec 056 / ADR 0039 / Figma 07.10-07.12)

create table if not exists public.v2_blocked_users (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint check_different_users check (blocker_id <> blocked_id)
);

comment on table public.v2_blocked_users is 'Relação privada de bloqueio entre pessoas da comunidade.';
comment on column public.v2_blocked_users.blocker_id is 'Usuário que executou o bloqueio.';
comment on column public.v2_blocked_users.blocked_id is 'Usuário que foi bloqueado.';

alter table public.v2_blocked_users enable row level security;

create policy "usuário lê apenas suas próprias pessoas bloqueadas"
  on public.v2_blocked_users for select
  to authenticated
  using (blocker_id = (select auth.uid()));

create policy "usuário bloqueia apenas em seu próprio nome"
  on public.v2_blocked_users for insert
  to authenticated
  with check (blocker_id = (select auth.uid()));

create policy "usuário desbloqueia apenas quem ele próprio bloqueou"
  on public.v2_blocked_users for delete
  to authenticated
  using (blocker_id = (select auth.uid()));

grant select, insert, delete on public.v2_blocked_users to authenticated;
