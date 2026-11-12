-- Spec 099 / ADR 0075: preferência por tipo de aviso, para o push chegar como em app profissional.
--
-- `muted_types` guarda os tipos que a pessoa NÃO quer receber por push. Vazio = recebe tudo
-- (mantém o comportamento da Spec 096). A coluna herda a RLS de `v2_user_preferences`: só o titular
-- lê e grava. Aditiva e idempotente: não altera nem apaga dados existentes.

alter table public.v2_user_preferences
  add column if not exists muted_types text[] not null default '{}';

comment on column public.v2_user_preferences.muted_types is
  'Tipos de aviso desativados para push. Vazio = recebe todos. Privado do titular (Spec 099).';

-- Grant explícito, igual às demais tabelas v2: mantém o comportamento remoto e permite testar a
-- RLS no banco local (PGlite).
grant select, insert, update on public.v2_user_preferences to authenticated;
