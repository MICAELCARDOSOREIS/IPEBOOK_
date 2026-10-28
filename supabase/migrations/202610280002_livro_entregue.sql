-- Spec 095 / ADR 0070: depois da entrega concluída por QR code, o livro deixa de ser "reservado" e vira "entregue".
-- Entregue sai do catálogo público (as consultas já ocultam os status que não são "available" ou "reserved").

alter table public.v2_books drop constraint if exists v2_books_status_check;
alter table public.v2_books
  add constraint v2_books_status_check
  check (status in ('available', 'reserved', 'paused', 'draft', 'delivered'));

create function public.v2_mark_book_delivered()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.v2_books b
     set status = 'delivered'
    from public.v2_book_requests r
   where r.id = new.request_id and b.id = r.listing_id and b.status = 'reserved';
  return new;
end;
$$;
revoke all on function public.v2_mark_book_delivered() from public, anon, authenticated;

create trigger v2_delivery_marks_book_delivered
after insert on public.v2_deliveries
for each row execute function public.v2_mark_book_delivered();

-- Entregas que já estavam concluídas antes desta migração.
update public.v2_books b
   set status = 'delivered'
  from public.v2_book_requests r
  join public.v2_deliveries d on d.request_id = r.id
 where b.id = r.listing_id and b.status = 'reserved';
