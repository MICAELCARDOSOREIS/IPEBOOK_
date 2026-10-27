-- Spec 090: apagar conversa. O histórico é imutável e compartilhado, então "apagar" oculta a
-- conversa só para quem apagou; ela reaparece se chegar mensagem posterior a hidden_at.
create table public.v2_hidden_conversations (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  request_id uuid not null references public.v2_book_requests(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

alter table public.v2_hidden_conversations enable row level security;

create policy v2_hidden_conversations_select on public.v2_hidden_conversations
  for select to authenticated using (user_id = auth.uid());

create policy v2_hidden_conversations_insert on public.v2_hidden_conversations
  for insert to authenticated with check (user_id = auth.uid());

create policy v2_hidden_conversations_update on public.v2_hidden_conversations
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.v2_hidden_conversations from anon, public;
grant select, insert, update on public.v2_hidden_conversations to authenticated;
