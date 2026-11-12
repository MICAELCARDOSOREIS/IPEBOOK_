-- Spec 096 / ADR 0071: push dos avisos para o celular, fora do app.

-- RN-03: cada aviso é enviado no máximo uma vez.
alter table public.v2_notifications add column if not exists pushed_at timestamptz;

-- RN-02: um token pertence a uma só pessoa; gravá-lo numa conta o retira das outras.
create function public.v2_release_duplicate_push_token()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.push_token is not null then
    update public.v2_user_preferences p
       set push_token = null
     where p.push_token = new.push_token and p.user_id <> new.user_id;
  end if;
  return new;
end;
$$;
revoke all on function public.v2_release_duplicate_push_token() from public, anon, authenticated;

create trigger v2_preferences_release_push_token
after insert or update of push_token on public.v2_user_preferences
for each row execute function public.v2_release_duplicate_push_token();

-- RN-06: URL da função e chave pública, preenchidas uma vez por ambiente; o app não lê esta tabela.
create table public.v2_push_settings (
  id boolean primary key default true check (id),
  function_url text not null,
  publishable_key text not null
);
alter table public.v2_push_settings enable row level security;
revoke all on public.v2_push_settings from anon, authenticated, public;

-- pg_net só existe no Supabase hospedado; no banco local de testes a criação é ignorada.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net with schema extensions;
  end if;
end
$$;

-- RN-05: nunca impede criar o aviso; sem configuração ou sem pg_net, não faz nada.
create function public.v2_push_new_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ajuste public.v2_push_settings%rowtype;
begin
  select * into ajuste from public.v2_push_settings limit 1;
  if not found or to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    return new;
  end if;
  begin
    perform net.http_post(
      url := ajuste.function_url,
      body := jsonb_build_object('id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || ajuste.publishable_key
      ),
      timeout_milliseconds := 5000
    );
  exception when others then
    null;
  end;
  return new;
end;
$$;
revoke all on function public.v2_push_new_notification() from public, anon, authenticated;

create trigger v2_notification_pushes_to_device
after insert on public.v2_notifications
for each row execute function public.v2_push_new_notification();
