-- Spec 103 / ADR 0079: limites por pessoa contra abuso e spam. O erro usa o código próprio `IBLIM`, que o
-- app mostra como está (mensagem em português). As funções do sistema (SECURITY DEFINER) não são limitadas.

create function public.v2_enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quem uuid := (select auth.uid());
  total int;
begin
  -- Só limita chamadas de contas logadas (papel `authenticated`); scripts e o painel passam.
  if quem is null or current_setting('role', true) is distinct from 'authenticated' then
    return new;
  end if;

  if tg_table_name = 'v2_books' then
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
revoke all on function public.v2_enforce_rate_limit() from public, anon, authenticated;

create trigger v2_books_rate_limit before insert on public.v2_books
  for each row execute function public.v2_enforce_rate_limit();
create trigger v2_book_requests_rate_limit before insert on public.v2_book_requests
  for each row execute function public.v2_enforce_rate_limit();
create trigger v2_negotiation_messages_rate_limit before insert on public.v2_negotiation_messages
  for each row execute function public.v2_enforce_rate_limit();
create trigger v2_reports_rate_limit before insert on public.v2_reports
  for each row execute function public.v2_enforce_rate_limit();
create trigger v2_user_reports_rate_limit before insert on public.v2_user_reports
  for each row execute function public.v2_enforce_rate_limit();
