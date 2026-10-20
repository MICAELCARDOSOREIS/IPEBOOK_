-- Bucket de fotos dos anúncios para a comunidade de Piripiri, PI (Spec 023 / Issue #116)
-- Criação do bucket público book-photos com limite de 5MB e formatos aceitos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-photos',
  'book-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Políticas de RLS em storage.objects para o bucket book-photos
-- 1. Leitura pública: qualquer pessoa (inclusive visitante não autenticado) pode ver as capas
drop policy if exists "Fotos de livros são públicas" on storage.objects;
create policy "Fotos de livros são públicas"
  on storage.objects for select
  using (bucket_id = 'book-photos');

-- 2. Inserção: apenas usuários autenticados sob seu próprio diretório {owner_id}/*
drop policy if exists "Usuário autenticado envia fotos do seu anúncio" on storage.objects;
create policy "Usuário autenticado envia fotos do seu anúncio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'book-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 3. Exclusão: apenas o proprietário pode apagar suas fotos
drop policy if exists "Proprietário exclui fotos do seu anúncio" on storage.objects;
create policy "Proprietário exclui fotos do seu anúncio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'book-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
