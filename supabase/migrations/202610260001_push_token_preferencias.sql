-- Token de notificação push nas preferências privadas (ADR 0062)
--
-- O app passou a ler e gravar `push_token` em `v2_user_preferences` sem migração correspondente;
-- no banco remoto a consulta inteira falhava e "Editar perfil" mostrava
-- "Não foi possível consultar as preferências." A coluna herda a RLS da tabela: só o titular lê
-- e grava. Aditiva e idempotente: não altera nem apaga dados existentes.

alter table public.v2_user_preferences
  add column if not exists push_token text;

comment on column public.v2_user_preferences.push_token is
  'Token de notificação push do dispositivo (Expo), opcional e privado do titular.';

-- A tabela dependia dos privilégios padrão do Supabase hospedado; o grant explícito (igual às demais
-- tabelas v2) mantém o comportamento remoto e permite testar a RLS no banco local (PGlite).
grant select, insert, update on public.v2_user_preferences to authenticated;
