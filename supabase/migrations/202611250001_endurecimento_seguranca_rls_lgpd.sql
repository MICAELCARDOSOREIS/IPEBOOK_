-- Spec 143 / ADR 0119: endurecimento de segurança, RLS, triggers e conformidade LGPD.
-- Cobre:
--   A1: máquina de estados em public.v2_books (sem retorno a draft; sem alteração direta de status em reserved/delivered/moderation_hold por authenticated).
--   A2: coluna webhook_secret em public.v2_push_settings e envio do cabeçalho X-Push-Webhook-Secret em public.v2_push_new_notification().
--   A3: delete_user_account() removendo também public.v2_beta_testers e políticas restritivas em storage.objects para conta suspensa.
--   M4: política INSERT de public.v2_book_requests exigindo ausência de bloqueio bilateral e posse+disponibilidade de offered_book_id.
--   M6: limite de alertas em public.v2_search_alerts para BEFORE INSERT OR UPDATE OF active (20 ativos + teto de 50 totais).
--   M7: políticas restritivas UPDATE/DELETE em public.v2_books para conta suspensa e validação SQL de v2_books.photos (máx. 5 URLs https://).

-- ============================================================================
-- A1: Máquina de estados e guarda de moderação em public.v2_books
-- ============================================================================
create or replace function public.v2_guard_moderation_hold()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Nenhum anúncio que saiu de rascunho pode voltar a draft (evita bypass de exclusão física e regras de conteúdo).
  if new.status = 'draft' and old.status <> 'draft' then
    raise exception 'Anúncio publicado não pode voltar para rascunho';
  end if;

  if current_user in ('authenticated', 'anon') then
    if new.moderation_hold is distinct from old.moderation_hold then
      raise exception 'Retenção da moderação não pode ser alterada';
    end if;

    if old.moderation_hold then
      raise exception 'Anúncio em análise pela moderação';
    end if;

    if new.status is distinct from old.status then
      if old.status in ('reserved', 'delivered') then
        raise exception 'Anúncio reservado ou entregue não pode ter o status alterado diretamente';
      end if;

      if new.status = 'available' and public.v2_current_user_suspended() then
        raise exception 'Anúncio em análise pela moderação';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- ============================================================================
-- A2: Segredo dedicado de webhook em public.v2_push_settings e trigger de push
-- ============================================================================
alter table public.v2_push_settings
  add column if not exists webhook_secret text;

-- RN-05 preservada: nunca impede gravar v2_notifications; sem configuração, sem segredo ou sem pg_net, não faz nada.
create or replace function public.v2_push_new_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ajuste public.v2_push_settings%rowtype;
begin
  select * into ajuste from public.v2_push_settings limit 1;
  if not found
    or nullif(btrim(coalesce(ajuste.webhook_secret, '')), '') is null
    or to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    return new;
  end if;
  begin
    perform net.http_post(
      url := ajuste.function_url,
      body := jsonb_build_object('id', new.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || ajuste.publishable_key,
        'X-Push-Webhook-Secret', ajuste.webhook_secret
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

-- ============================================================================
-- A3: Eliminação completa em delete_user_account() (inclui v2_beta_testers)
--     e proteção do Storage (book-photos) contra conta suspensa
-- ============================================================================
create or replace function public.delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_email text;
begin
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'Não autorizado a excluir esta conta';
  end if;

  -- Excluir apagaria a suspensão em cascata e liberaria o recadastro com o mesmo e-mail.
  if exists (select 1 from public.v2_suspended_users where user_id = target_user_id) then
    raise exception 'Conta suspensa não pode ser excluída pelo app. Escreva para ipebook738@gmail.com.';
  end if;

  -- Remove eventual inscrição do titular no programa beta (LGPD Art. 18).
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth' and table_name = 'users' and column_name = 'email'
  ) then
    execute 'select lower(btrim(email)) from auth.users where id = $1' into v_email using target_user_id;
  end if;

  if v_email is not null and v_email <> '' and to_regclass('public.v2_beta_testers') is not null then
    delete from public.v2_beta_testers where email = v_email;
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'delete from public.profiles where user_id = $1' using target_user_id;
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;
revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated;

drop policy if exists "Conta suspensa não envia fotos no storage" on storage.objects;
create policy "Conta suspensa não envia fotos no storage" on storage.objects
  as restrictive for insert to authenticated
  with check (bucket_id <> 'book-photos' or not public.v2_current_user_suspended());

drop policy if exists "Conta suspensa não atualiza fotos no storage" on storage.objects;
create policy "Conta suspensa não atualiza fotos no storage" on storage.objects
  as restrictive for update to authenticated
  using (bucket_id <> 'book-photos' or not public.v2_current_user_suspended())
  with check (bucket_id <> 'book-photos' or not public.v2_current_user_suspended());

drop policy if exists "Conta suspensa não remove fotos no storage" on storage.objects;
create policy "Conta suspensa não remove fotos no storage" on storage.objects
  as restrictive for delete to authenticated
  using (bucket_id <> 'book-photos' or not public.v2_current_user_suspended());

-- ============================================================================
-- M4: Integridade de pedidos em public.v2_book_requests (bloqueio bilateral e offered_book_id)
-- ============================================================================
create or replace function public.v2_has_block_with_listing_owner(target_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.v2_books b
    join public.v2_blocked_users bu
      on (bu.blocker_id = (select auth.uid()) and bu.blocked_id = b.owner_id)
      or (bu.blocker_id = b.owner_id and bu.blocked_id = (select auth.uid()))
    where b.id = target_listing_id
  );
$$;
revoke all on function public.v2_has_block_with_listing_owner(uuid) from public, anon;
grant execute on function public.v2_has_block_with_listing_owner(uuid) to authenticated;

drop policy if exists "Leitor solicita livro de outra pessoa nesta versão" on public.v2_book_requests;
create policy "Leitor solicita livro de outra pessoa nesta versão" on public.v2_book_requests
  for insert to authenticated with check (
    requester_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1 from public.v2_books b
      where b.id = listing_id
        and b.owner_id <> (select auth.uid())
        and b.status = 'available'
    )
    and not public.v2_has_block_with_listing_owner(listing_id)
    and (
      offered_book_id is null
      or exists (
        select 1 from public.v2_books ob
        where ob.id = offered_book_id
          and ob.owner_id = (select auth.uid())
          and ob.status = 'available'
      )
    )
  );

-- ============================================================================
-- M6: Limite completo de alertas em public.v2_search_alerts (INSERT e reativação)
-- ============================================================================
create or replace function public.v2_enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quem uuid := (select auth.uid());
  total int;
begin
  if quem is null or current_setting('role', true) is distinct from 'authenticated' then
    return new;
  end if;

  if tg_table_name = 'v2_search_alerts' then
    if tg_op = 'INSERT' then
      select count(*) into total
        from public.v2_search_alerts
        where user_id = quem;
      if total >= 50 then
        raise exception using errcode = 'IBLIM', message = 'Limite de 50 alertas cadastrados atingido.';
      end if;

      if new.active then
        select count(*) into total
          from public.v2_search_alerts
          where user_id = quem and active;
        if total >= 20 then
          raise exception using errcode = 'IBLIM', message = 'Limite de 20 alertas ativos atingido.';
        end if;
      end if;
    elsif tg_op = 'UPDATE' then
      if new.active and not old.active then
        select count(*) into total
          from public.v2_search_alerts
          where user_id = quem and active and id <> old.id;
        if total >= 20 then
          raise exception using errcode = 'IBLIM', message = 'Limite de 20 alertas ativos atingido.';
        end if;
      end if;
    end if;
  elsif tg_table_name = 'v2_books' then
    select count(*) into total from public.v2_books
      where owner_id = quem and created_at > now() - interval '24 hours';
    if total >= 15 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 15 anúncios por dia atingido. Tente de novo amanhã.';
    end if;
  elsif tg_table_name = 'v2_book_requests' then
    select count(*) into total from public.v2_book_requests
      where requester_id = quem and created_at > now() - interval '24 hours';
    if total >= 10 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 10 pedidos por dia atingido. Tente de novo amanhã.';
    end if;
  elsif tg_table_name = 'v2_negotiation_messages' then
    select count(*) into total from public.v2_negotiation_messages
      where sender_id = quem and created_at > now() - interval '5 minutes';
    if total >= 30 then
      raise exception using errcode = 'IBLIM', message = 'Muitas mensagens em pouco tempo. Espere alguns minutos.';
    end if;
  elsif tg_table_name in ('v2_reports', 'v2_user_reports') then
    select (select count(*) from public.v2_reports where reporter_id = quem and created_at > now() - interval '24 hours')
         + (select count(*) from public.v2_user_reports where reporter_id = quem and created_at > now() - interval '24 hours')
      into total;
    if total >= 10 then
      raise exception using errcode = 'IBLIM', message = 'Limite de 10 denúncias por dia atingido. Fale com a equipe se precisar.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists v2_search_alerts_rate_limit on public.v2_search_alerts;
create trigger v2_search_alerts_rate_limit
before insert or update of active on public.v2_search_alerts
for each row execute function public.v2_enforce_rate_limit();

-- ============================================================================
-- M7: Suspensão em UPDATE/DELETE de public.v2_books e validação HTTPS de v2_books.photos
-- ============================================================================
drop policy if exists "Conta suspensa não altera anúncio" on public.v2_books;
create policy "Conta suspensa não altera anúncio" on public.v2_books
  as restrictive for update to authenticated
  using (not public.v2_current_user_suspended())
  with check (not public.v2_current_user_suspended());

drop policy if exists "Conta suspensa não exclui anúncio" on public.v2_books;
create policy "Conta suspensa não exclui anúncio" on public.v2_books
  as restrictive for delete to authenticated
  using (not public.v2_current_user_suspended());

create or replace function public.v2_valid_https_photos(urls text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select urls is null
    or (
      coalesce(array_ndims(urls), 1) = 1
      and coalesce(cardinality(urls), 0) <= 5
      and not exists (
        select 1 from unnest(urls) as u
        where u is null or u !~* '^https://'
      )
    );
$$;

alter table public.v2_books
  drop constraint if exists v2_books_photos_https_max5;
alter table public.v2_books
  add constraint v2_books_photos_https_max5
  check (public.v2_valid_https_photos(photos)) not valid;
