-- Spec 052 / ADR 0036: encontro combinado numa negociação aceita (Figma 06.04, 06.05, 06.11–06.14).

-- Avisos de encontro usam um tipo próprio de notificação.
alter table public.v2_notifications drop constraint if exists v2_notifications_type_check;
alter table public.v2_notifications add constraint v2_notifications_type_check check (
  type in ('request_received', 'request_accepted', 'safety_tip', 'system', 'search_alert_match', 'meeting_update')
);

create table public.v2_meetings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.v2_book_requests(id) on delete cascade,
  -- Mesma lista de PIRIPIRI_MEETING_POINTS (src/model/entities/meetingPoint.ts), comparada em teste.
  point_name text not null check (point_name in (
    'Campus IFPI Piripiri (Recepção ou Biblioteca)',
    'Praça da Bandeira (Centro)',
    'Praça de Alimentação / Mercado Central',
    'Praça de Eventos'
  )),
  scheduled_at timestamptz not null,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'proposed' check (status in ('proposed', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RN-04: um encontro ativo (proposto ou confirmado) por pedido.
create unique index v2_meetings_one_active_per_request_idx
  on public.v2_meetings (request_id) where status <> 'cancelled';

-- RN-01: participante de pedido aceito. SECURITY DEFINER para ler o livro reservado sem expô-lo.
create function public.v2_is_meeting_participant(target_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.v2_book_requests r
    join public.v2_books b on b.id = r.listing_id
    where r.id = target_request_id
      and r.status = 'accepted'
      and (r.requester_id = (select auth.uid()) or b.owner_id = (select auth.uid()))
  );
$$;
revoke all on function public.v2_is_meeting_participant(uuid) from public, anon;
grant execute on function public.v2_is_meeting_participant(uuid) to authenticated;

-- RN-03, RN-05 a RN-07: datas futuras, autoria do convite e transições válidas.
create function public.guard_v2_meeting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'proposed' or new.proposed_by <> (select auth.uid()) then
      raise exception 'Convite deve ser enviado por quem participa';
    end if;
  else
    if new.request_id <> old.request_id or new.created_at <> old.created_at then
      raise exception 'Encontro não pode mudar de negociação';
    end if;
    if old.status = 'cancelled' then
      raise exception 'Encontro cancelado não pode ser alterado';
    end if;
    if new.status = 'confirmed' then
      if old.status <> 'proposed' or (select auth.uid()) = old.proposed_by
        or new.proposed_by <> old.proposed_by or new.point_name <> old.point_name
        or new.scheduled_at <> old.scheduled_at then
        raise exception 'Só a outra pessoa confirma o convite';
      end if;
    elsif new.status = 'cancelled' then
      if new.proposed_by <> old.proposed_by or new.point_name <> old.point_name
        or new.scheduled_at <> old.scheduled_at then
        raise exception 'Cancelamento não altera o encontro';
      end if;
    elsif new.proposed_by <> (select auth.uid()) then
      raise exception 'Reagendamento deve ser enviado por quem participa';
    end if;
    new.updated_at := now();
  end if;
  if new.status = 'proposed'
    and (new.scheduled_at <= now() or new.scheduled_at > now() + interval '8 days') then
    raise exception 'Encontro deve ser marcado entre amanhã e os próximos sete dias';
  end if;
  if new.status = 'confirmed' and new.scheduled_at <= now() then
    raise exception 'Encontro no passado não pode ser confirmado';
  end if;
  return new;
end;
$$;

create trigger guard_v2_meeting_before_write
before insert or update on public.v2_meetings
for each row execute function public.guard_v2_meeting();

-- RN-08: avisa a outra pessoa da negociação. Textos iguais a meetingNotice (src/model/entities/meetingNotice.ts).
create function public.v2_notify_meeting_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pedido public.v2_book_requests%rowtype;
  dono uuid;
  autor uuid := coalesce((select auth.uid()), new.proposed_by);
  titulo text;
  mensagem text;
begin
  select * into pedido from public.v2_book_requests where id = new.request_id;
  select owner_id into dono from public.v2_books where id = pedido.listing_id;

  if tg_op = 'INSERT' then
    titulo := 'Convite para encontro';
    mensagem := 'Você recebeu um convite para ' || new.point_name || '. Confirme na negociação.';
  elsif new.status = 'proposed' then
    titulo := 'Encontro reagendado';
    mensagem := 'Nova sugestão em ' || new.point_name || '. Confirme na negociação.';
  elsif new.status = 'confirmed' then
    titulo := 'Encontro confirmado';
    mensagem := 'O encontro em ' || new.point_name || ' está combinado.';
  else
    titulo := 'Encontro cancelado';
    mensagem := 'O encontro em ' || new.point_name || ' foi cancelado. Vocês podem combinar outro dia.';
  end if;

  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values (
    case when autor = pedido.requester_id then dono else pedido.requester_id end,
    titulo, mensagem, 'meeting_update', '/negociacao/' || new.request_id::text
  );
  return new;
end;
$$;
revoke all on function public.v2_notify_meeting_change() from public, anon, authenticated;

create trigger v2_meeting_notifies_counterpart
after insert or update on public.v2_meetings
for each row execute function public.v2_notify_meeting_change();

alter table public.v2_meetings enable row level security;

create policy "Participantes consultam o encontro" on public.v2_meetings
  for select to authenticated using (public.v2_is_meeting_participant(request_id));
create policy "Participantes convidam para encontro" on public.v2_meetings
  for insert to authenticated with check (public.v2_is_meeting_participant(request_id));
create policy "Participantes atualizam o encontro" on public.v2_meetings
  for update to authenticated
  using (public.v2_is_meeting_participant(request_id))
  with check (public.v2_is_meeting_participant(request_id));

grant select, insert on public.v2_meetings to authenticated;
grant update (point_name, scheduled_at, proposed_by, status) on public.v2_meetings to authenticated;
