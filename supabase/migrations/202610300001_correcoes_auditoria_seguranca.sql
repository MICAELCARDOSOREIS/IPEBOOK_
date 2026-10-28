-- Spec 107 / ADR 0083: correções da auditoria de segurança (2026-10-28).
-- 1. Suspensão cobre todas as ações que atingem outras pessoas (encontros, avaliações, denúncias, perfil,
--    aceitar pedido), e não só anunciar, pedir e mandar mensagem.
-- 2. Conta suspensa não se exclui (excluir apagava a suspensão e liberava o recadastro).
-- 3. Ninguém consulta se outra pessoa está suspensa: v2_is_suspended(uuid) deixa de ser chamável pelo app.
-- 4. Links de foto aceitam só https (barra http e esquemas estranhos gravados direto pela API).

create function public.v2_current_user_suspended()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.v2_suspended_users where user_id = (select auth.uid()));
$$;
revoke all on function public.v2_current_user_suspended() from public, anon;
grant execute on function public.v2_current_user_suspended() to authenticated;

-- As políticas e o gatilho existentes passam a usar a versão sem argumento.
drop policy "Conta suspensa não publica" on public.v2_books;
drop policy "Conta suspensa não pede livro" on public.v2_book_requests;
drop policy "Conta suspensa não envia mensagem" on public.v2_negotiation_messages;
create policy "Conta suspensa não publica" on public.v2_books
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não pede livro" on public.v2_book_requests
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não envia mensagem" on public.v2_negotiation_messages
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());

create policy "Conta suspensa não propõe encontro" on public.v2_meetings
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não altera encontro" on public.v2_meetings
  as restrictive for update to authenticated using (not public.v2_current_user_suspended());
create policy "Conta suspensa não avalia" on public.v2_ratings
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não denuncia anúncio" on public.v2_reports
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não denuncia pessoa" on public.v2_user_reports
  as restrictive for insert to authenticated with check (not public.v2_current_user_suspended());
create policy "Conta suspensa não edita perfil" on public.v2_profiles
  as restrictive for update to authenticated using (not public.v2_current_user_suspended());

-- O dono só altera o próprio anúncio (RLS), então a conta suspensa é a de quem está logado.
create or replace function public.v2_guard_moderation_hold()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.moderation_hold is distinct from old.moderation_hold then
      raise exception 'Retenção da moderação não pode ser alterada';
    end if;
    if new.status = 'available' and old.status <> 'available'
      and (old.moderation_hold or public.v2_current_user_suspended()) then
      raise exception 'Anúncio em análise pela moderação';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.v2_is_suspended(uuid) from authenticated;

-- accept_book_request é SECURITY DEFINER e escapa das políticas; o gatilho vale para qualquer caminho.
create function public.v2_guard_suspended_accept()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted'
    and exists (select 1 from public.v2_suspended_users where user_id = (select auth.uid())) then
    raise exception 'Conta suspensa não aceita pedidos';
  end if;
  return new;
end;
$$;
revoke all on function public.v2_guard_suspended_accept() from public, anon, authenticated;

create trigger v2_book_requests_guard_suspended_accept
before update on public.v2_book_requests
for each row execute function public.v2_guard_suspended_accept();

create or replace function public.delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'Não autorizado a excluir esta conta';
  end if;

  -- Excluir apagaria a suspensão em cascata e liberaria o recadastro com o mesmo e-mail.
  if exists (select 1 from public.v2_suspended_users where user_id = target_user_id) then
    raise exception 'Conta suspensa não pode ser excluída pelo app. Escreva para ipebook738@gmail.com.';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'delete from public.profiles where user_id = $1' using target_user_id;
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;
revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated;

-- not valid: vale para gravações novas sem reprovar dados antigos já publicados.
alter table public.v2_profiles
  add constraint v2_profiles_photo_url_https check (photo_url is null or photo_url ~* '^https://') not valid;
alter table public.v2_books
  add constraint v2_books_photo_url_https check (photo_url is null or photo_url ~* '^https://') not valid;
