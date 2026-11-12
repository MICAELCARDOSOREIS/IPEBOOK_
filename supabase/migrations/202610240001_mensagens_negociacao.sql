-- Spec 061 / ADR 0044: Mensagens e Chat da Negociação Presencial (Figma 06.01, 06.02, 06.10, 06.16)

create table public.v2_negotiation_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.v2_book_requests(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) >= 1 and length(content) <= 1000),
  created_at timestamptz not null default now()
);

-- Índice para ordenação rápida por pedido
create index v2_negotiation_messages_request_idx on public.v2_negotiation_messages (request_id, created_at asc);

-- Função auxiliar de validação de envio (RN-02, RN-04)
create or replace function public.v2_can_send_negotiation_message(target_request_id uuid, target_sender_id uuid)
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
      and target_sender_id = (select auth.uid())
      and (r.requester_id = target_sender_id or b.owner_id = target_sender_id)
      -- Verifica se não há bloqueio ativo entre os participantes
      and not exists (
        select 1 from public.v2_blocked_users bu
        where (
          (bu.blocker_id = target_sender_id and bu.blocked_id in (r.requester_id, b.owner_id) and bu.blocked_id <> target_sender_id)
          or
          (bu.blocked_id = target_sender_id and bu.blocker_id in (r.requester_id, b.owner_id) and bu.blocker_id <> target_sender_id)
        )
      )
  );
$$;

revoke all on function public.v2_can_send_negotiation_message(uuid, uuid) from public, anon;
grant execute on function public.v2_can_send_negotiation_message(uuid, uuid) to authenticated;

alter table public.v2_negotiation_messages enable row level security;

-- Política de Leitura: apenas participantes do pedido aceito
create policy v2_negotiation_messages_select on public.v2_negotiation_messages
  for select to authenticated
  using (public.v2_is_meeting_participant(request_id));

-- Política de Inserção: participante legítimo, remetente autêntico e sem bloqueio
create policy v2_negotiation_messages_insert on public.v2_negotiation_messages
  for insert to authenticated
  with check (public.v2_can_send_negotiation_message(request_id, sender_id));

-- Proibir UPDATE e DELETE por clientes (imutabilidade do histórico)
create policy v2_negotiation_messages_update on public.v2_negotiation_messages
  for update to authenticated
  using (false);

create policy v2_negotiation_messages_delete on public.v2_negotiation_messages
  for delete to authenticated
  using (false);

grant select, insert on public.v2_negotiation_messages to authenticated;
revoke all on public.v2_negotiation_messages from anon, public;
grant select, insert on public.v2_negotiation_messages to authenticated;
