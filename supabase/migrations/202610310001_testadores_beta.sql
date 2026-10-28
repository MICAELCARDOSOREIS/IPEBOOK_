-- Spec 108: inscrições para o teste do app Android na Play Store (página pública /beta).
-- A tabela não é exposta: anônimos e contas logadas só chamam v2_register_beta_tester.

create table public.v2_beta_testers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (char_length(email) <= 254 and email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  name text check (name is null or char_length(name) <= 80),
  created_at timestamptz not null default now(),
  invited_at timestamptz
);

alter table public.v2_beta_testers enable row level security;
revoke all on table public.v2_beta_testers from anon, authenticated;

create function public.v2_register_beta_tester(p_email text, p_name text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  recentes int;
begin
  if v_email = '' or char_length(v_email) > 254
     or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'Informe um e-mail válido.';
  end if;
  if v_name is not null and char_length(v_name) > 80 then
    raise exception using errcode = '22023', message = 'O nome deve ter no máximo 80 caracteres.';
  end if;

  if exists (select 1 from public.v2_beta_testers where email = v_email) then
    return;
  end if;

  select count(*) into recentes from public.v2_beta_testers where created_at > now() - interval '1 hour';
  if recentes >= 300 then
    raise exception using errcode = 'IBLIM', message = 'Muitas inscrições agora. Tente de novo em alguns minutos.';
  end if;

  insert into public.v2_beta_testers (email, name) values (v_email, v_name)
  on conflict (email) do nothing;
end;
$$;

revoke all on function public.v2_register_beta_tester(text, text) from public;
grant execute on function public.v2_register_beta_tester(text, text) to anon, authenticated;
