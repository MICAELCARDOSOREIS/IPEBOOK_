-- Spec 095 / ADR 0070: concluir a negociação por QR code.
-- O gatilho de v2_book_requests proíbe alterar pedidos aceitos, então a conclusão vive numa tabela própria.

-- Entrega concluída: uma linha por pedido, lida pelas duas pessoas e escrita só pela função abaixo.
create table public.v2_deliveries (
  request_id uuid primary key references public.v2_book_requests(id) on delete cascade,
  completed_by uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now()
);
alter table public.v2_deliveries enable row level security;
create policy "Participantes consultam a entrega" on public.v2_deliveries
  for select to authenticated using (public.v2_is_meeting_participant(request_id));
-- Só leitura: a escrita acontece apenas pela função complete_delivery.
revoke all on public.v2_deliveries from anon, public;
grant select on public.v2_deliveries to authenticated;

-- Código de uso único: sem nenhuma política, só as funções SECURITY DEFINER o leem ou alteram.
create table public.v2_delivery_codes (
  request_id uuid primary key references public.v2_book_requests(id) on delete cascade,
  code text not null check (code ~ '^[23456789A-HJKMNP-Z]{8}$'),
  expires_at timestamptz not null,
  attempts integer not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade
);
alter table public.v2_delivery_codes enable row level security;
revoke all on public.v2_delivery_codes from anon, authenticated;

-- RN-02, RN-03: só o anunciante gera, com encontro confirmado; um código novo invalida o anterior.
create function public.create_delivery_code(target_request_id uuid)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario uuid := (select auth.uid());
  pedido public.v2_book_requests%rowtype;
  dono uuid;
  alfabeto constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  bytes bytea := uuid_send(gen_random_uuid());
  posicoes constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  novo text := '';
  validade timestamptz := now() + interval '15 minutes';
  i int;
begin
  if usuario is null then raise exception 'Sessão obrigatória para concluir a entrega'; end if;
  select * into pedido from public.v2_book_requests where id = target_request_id;
  if not found or pedido.status <> 'accepted' then
    raise exception 'Negociação não encontrada ou ainda não aceita';
  end if;
  select owner_id into dono from public.v2_books where id = pedido.listing_id;
  if dono is distinct from usuario then
    raise exception 'Só quem anunciou o livro mostra o QR da entrega';
  end if;
  if exists (select 1 from public.v2_deliveries d where d.request_id = target_request_id) then
    raise exception 'A entrega desta negociação já foi concluída';
  end if;
  if not exists (select 1 from public.v2_meetings m where m.request_id = target_request_id and m.status = 'confirmed') then
    raise exception 'Confirme o encontro antes de concluir a entrega';
  end if;

  -- 8 caracteres de um alfabeto sem ambiguidade, de bytes sem os bits fixos do UUID v4.
  foreach i in array posicoes loop
    novo := novo || substr(alfabeto, 1 + (get_byte(bytes, i) % 31), 1);
  end loop;

  insert into public.v2_delivery_codes as c (request_id, code, expires_at, attempts, created_by)
  values (target_request_id, novo, validade, 0, usuario)
  on conflict (request_id) do update
    set code = excluded.code, expires_at = excluded.expires_at, attempts = 0, created_by = excluded.created_by;

  return query select novo, validade;
end;
$$;
revoke all on function public.create_delivery_code(uuid) from public, anon;
grant execute on function public.create_delivery_code(uuid) to authenticated;

-- RN-02 a RN-06: só o leitor confirma. Erro de código volta como resultado (e não como exceção) para que a
-- contagem de tentativas não seja desfeita pelo rollback.
create function public.complete_delivery(target_request_id uuid, informado text)
returns table (resultado text, concluida_em timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  usuario uuid := (select auth.uid());
  pedido public.v2_book_requests%rowtype;
  dono uuid;
  registro public.v2_delivery_codes%rowtype;
  agora timestamptz := now();
begin
  if usuario is null then raise exception 'Sessão obrigatória para concluir a entrega'; end if;
  select * into pedido from public.v2_book_requests where id = target_request_id;
  if not found or pedido.status <> 'accepted' then
    raise exception 'Negociação não encontrada ou ainda não aceita';
  end if;
  if pedido.requester_id <> usuario then
    raise exception 'Só quem recebe o livro lê o QR da entrega';
  end if;
  if exists (select 1 from public.v2_deliveries d where d.request_id = target_request_id) then
    raise exception 'A entrega desta negociação já foi concluída';
  end if;
  if not exists (select 1 from public.v2_meetings m where m.request_id = target_request_id and m.status = 'confirmed') then
    raise exception 'Confirme o encontro antes de concluir a entrega';
  end if;

  select * into registro from public.v2_delivery_codes c where c.request_id = target_request_id for update;
  if not found or registro.expires_at <= agora then
    return query select 'expirado'::text, null::timestamptz;
    return;
  end if;
  if registro.attempts >= 5 then
    return query select 'bloqueado'::text, null::timestamptz;
    return;
  end if;
  if registro.code <> upper(coalesce(informado, '')) then
    update public.v2_delivery_codes c set attempts = c.attempts + 1 where c.request_id = target_request_id;
    return query select 'incorreto'::text, null::timestamptz;
    return;
  end if;

  insert into public.v2_deliveries (request_id, completed_by, completed_at) values (target_request_id, usuario, agora);
  delete from public.v2_delivery_codes c where c.request_id = target_request_id;

  -- RN-06: avisa o anunciante.
  select owner_id into dono from public.v2_books where id = pedido.listing_id;
  insert into public.v2_notifications (user_id, title, message, type, action_url)
  values (dono, 'Entrega confirmada', 'A entrega do livro foi confirmada. Avalie a negociação.',
    'meeting_update', '/negociacao/' || target_request_id::text);

  return query select 'ok'::text, agora;
end;
$$;
revoke all on function public.complete_delivery(uuid, text) from public, anon;
grant execute on function public.complete_delivery(uuid, text) to authenticated;
