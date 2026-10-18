-- Migração de índices de busca e performance para catálogo, filtros e moderação
-- Data: 2026-10-18 (ADR 0021)

-- 1. Otimização do catálogo e busca de livros
create index if not exists idx_v2_books_catalog_status_created
  on public.v2_books (status, created_at desc);

create index if not exists idx_v2_books_location_active
  on public.v2_books (city, neighborhood)
  where status = 'available';

create index if not exists idx_v2_books_modality_active
  on public.v2_books (modality)
  where status = 'available';

create index if not exists idx_v2_books_category_active
  on public.v2_books (category)
  where status = 'available' and category is not null;

create index if not exists idx_v2_books_owner
  on public.v2_books (owner_id, status);

create index if not exists idx_v2_books_title_lower
  on public.v2_books (lower(title));

create index if not exists idx_v2_books_author_lower
  on public.v2_books (lower(author));

-- 2. Otimização de negociações e pedidos
create index if not exists idx_v2_book_requests_listing_status
  on public.v2_book_requests (listing_id, status);

create index if not exists idx_v2_book_requests_requester_created
  on public.v2_book_requests (requester_id, created_at desc);

-- 3. Otimização de favoritos e alertas
create index if not exists idx_v2_favorites_user_created
  on public.v2_favorites (user_id, created_at desc);

create index if not exists idx_v2_favorites_book
  on public.v2_favorites (book_id);

create index if not exists idx_v2_search_alerts_active_user
  on public.v2_search_alerts (user_id)
  where active = true;

-- 4. Otimização da central de notificações
create index if not exists idx_v2_notifications_user_unread
  on public.v2_notifications (user_id, read, created_at desc);

-- 5. Otimização de moderação comunitária
create index if not exists idx_v2_reports_listing
  on public.v2_reports (listing_id);

create index if not exists idx_v2_reports_reporter
  on public.v2_reports (reporter_id);
