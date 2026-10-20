import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111';
const reader = '22222222-2222-4222-8222-222222222222';
const other = '33333333-3333-4333-8333-333333333333';
await db.exec(`create schema auth;
create role anon nologin;
create role authenticated nologin;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid stable language sql as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
insert into auth.users (id) values ('${owner}'), ('${reader}'), ('${other}');
create table public.listings (id uuid primary key);
create table public.book_requests (id uuid primary key);
create table public.profiles (user_id uuid primary key);
insert into public.listings (id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
insert into public.book_requests (id) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.profiles (user_id) values ('${owner}');
grant usage on schema public, auth to anon, authenticated;
grant select on auth.users to authenticated;
create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select string_to_array(name, '/');
$$;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.buckets to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;`);

for (const name of [
  '202610150001_contas_e_anuncios.sql',
  '202610150002_pedidos.sql',
  '202610150003_favoritos_alertas.sql',
  '202610170001_denuncias.sql',
  '202610170002_fotos_anuncios.sql',
  '202610170003_pausar_anuncio.sql',
  '202610180001_indices_busca_catalogo.sql',
  '202610200001_unicidade_denuncias.sql',
  '202610200002_rpc_exclusao_conta.sql',
  '202610200003_storage_book_photos.sql',
  '202610200004_extensao_pg_trgm_indices.sql',
  '202610200005_conservacao_descricao_anuncio.sql',
  '202610200006_perfil_publico_e_avaliacoes.sql',
]) {
  await db.exec(readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
}
const legacy = await db.query(`select
  (select count(*) from public.listings) as listings,
  (select count(*) from public.book_requests) as requests,
  (select count(*) from public.profiles) as profiles`);
if (Object.values(legacy.rows[0]).some((count) => Number(count) !== 1)) {
  throw new Error('Migração alterou os dados das tabelas legadas');
}
async function as(role, user, sql) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ?? ''}', false); set role ${role};`);
  return db.query(sql);
}

async function denied(label, action) {
  try {
    await action();
    throw new Error(`${label}: operação indevida permitida`);
  } catch (error) {
    if (error.message === `${label}: operação indevida permitida`) throw error;
    process.stdout.write(`${label}: negado\n`);
  }
}

await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${owner}', 'Livro', 'Autora', 'donation')`);
await denied('Conservação fora da lista', () => as('authenticated', owner, `update public.v2_books set condition = 'novo' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`));
await denied('Descrição acima de 280', () => as('authenticated', owner, `update public.v2_books set description = repeat('a', 281) where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`));
await as('authenticated', owner, `update public.v2_books set condition = 'good', description = 'Marcas leves de uso.' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`);
process.stdout.write('Conservação e descrição válidas: aceitas\n');
const books = await as('anon', null, `select id from public.v2_books`);
if (books.rows.length !== 1) throw new Error('Catálogo público indisponível');
await denied('Visitante publica', () => as('anon', null, `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Outro', 'Autora', 'donation')`));
await denied('Leitor falsifica proprietário', () => as('authenticated', reader, `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Outro', 'Autora', 'donation')`));
await denied('Dono solicita próprio livro', () => as('authenticated', owner, `insert into public.v2_book_requests (listing_id, requester_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${owner}')`));
await as('authenticated', reader, `insert into public.v2_book_requests (id, listing_id, requester_id)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${reader}')`);
const hidden = await as('authenticated', other, `select id from public.v2_book_requests where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`);
if (hidden.rows.length !== 0) throw new Error('Terceiro conseguiu ler pedido');
process.stdout.write('Terceiro lê pedido: oculto\n');
const blockedUpdate = await as('authenticated', other, `update public.v2_book_requests set status = 'accepted' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`);
if (blockedUpdate.affectedRows !== 0) throw new Error('Terceiro conseguiu responder pedido');
process.stdout.write('Terceiro responde pedido: nenhuma linha alterada\n');
await as('authenticated', owner, `update public.v2_book_requests set status = 'accepted' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`);
await denied('Pedido aceito não reabre', () => as('authenticated', owner, `update public.v2_book_requests set status = 'pending' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`));
await as('authenticated', reader, `insert into public.v2_favorites (user_id, book_id) values ('${reader}', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`);
const ownFavorites = await as('authenticated', reader, `select id from public.v2_favorites`);
if (ownFavorites.rows.length !== 1) throw new Error('Favorito do leitor não apareceu');
const otherFavorites = await as('authenticated', other, `select id from public.v2_favorites`);
if (otherFavorites.rows.length !== 0) throw new Error('Favoritos de outra pessoa expostos');
await denied('Leitor falsifica favorito', () => as('authenticated', other, `insert into public.v2_favorites (user_id, book_id) values ('${reader}', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`));
await as('authenticated', reader, `insert into public.v2_search_alerts (user_id, query) values ('${reader}', 'Casmurro')`);
await as('authenticated', owner, `insert into public.v2_search_alerts (user_id, query) values ('${owner}', 'Casmurro')`);
await as('authenticated', owner, `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Dom Casmurro', 'Machado de Assis', 'donation')`);
const notices = await as('authenticated', reader, `select type, action_url from public.v2_notifications`);
if (notices.rows.length !== 1 || notices.rows[0].type !== 'search_alert_match') throw new Error('Alerta não criou notificação');
const ownerNotices = await as('authenticated', owner, `select id from public.v2_notifications`);
if (ownerNotices.rows.length !== 0) throw new Error('Anunciante foi avisado sobre o próprio livro');
const hiddenAlerts = await as('authenticated', other, `select id from public.v2_search_alerts`);
if (hiddenAlerts.rows.length !== 0) throw new Error('Alertas de outra pessoa expostos');
await as('authenticated', other, `insert into public.v2_search_alerts (user_id, query) values ('${other}', 'Romance')`);
await as('authenticated', owner, `insert into public.v2_books (owner_id, title, author, category, modality) values ('${owner}', 'Outro livro', 'Outra pessoa', 'Romance', 'donation')`);
const categoryNotice = await as('authenticated', other, `select id from public.v2_notifications`);
if (categoryNotice.rows.length !== 1) throw new Error('Categoria não gerou notificação');
await as('authenticated', reader, `update public.v2_notifications set read = true`);
await denied('Leitor altera conteúdo de notificação', () => as('authenticated', reader, `update public.v2_notifications set title = 'alterado'`));

await denied('Visitante denuncia', () => as('anon', null, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${reader}', 'fraud_or_scam')`));
await denied('Leitor falsifica autor da denúncia', () => as('authenticated', reader, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${other}', 'fraud_or_scam')`));
await denied('Denúncia para anúncio inexistente', () => as('authenticated', reader, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('00000000-0000-4000-8000-000000000000', '${reader}', 'fraud_or_scam')`));
await as('authenticated', reader, `insert into public.v2_reports (id, listing_id, reporter_id, reason, details)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${reader}', 'fraud_or_scam', 'Suspeita de golpe')`);
await denied('Denúncia duplicada pelo mesmo leitor', () => as('authenticated', reader, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '${reader}', 'inappropriate_content')`));
const ownReports = await as('authenticated', reader, `select id from public.v2_reports where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'`);
if (ownReports.rows.length !== 1) throw new Error('Autor da denúncia não conseguiu consultar a própria denúncia');
const hiddenReports = await as('authenticated', other, `select id from public.v2_reports where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'`);
if (hiddenReports.rows.length !== 0) throw new Error('Terceiro conseguiu visualizar denúncia alheia');
process.stdout.write('Terceiro lê denúncia: oculto\n');
await denied('Terceiro altera denúncia', () => as('authenticated', other, `update public.v2_reports set reason = 'other' where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'`));

await as('authenticated', owner, `insert into public.v2_books (
  id, owner_id, title, author, modality, city, state, neighborhood, photo_url, photos
) values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  '${owner}',
  'Livro com Foto',
  'Autor Fotográfico',
  'donation',
  'Piripiri',
  'PI',
  'Centro',
  'https://exemplo.com/capa.jpg',
  array['https://exemplo.com/foto1.jpg', 'https://exemplo.com/foto2.jpg']
)`);
const bookWithPhoto = await as('anon', null, `select photo_url, photos, neighborhood from public.v2_books where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'`);
if (!bookWithPhoto.rows[0].photo_url || bookWithPhoto.rows[0].neighborhood !== 'Centro' || bookWithPhoto.rows[0].photos.length !== 2) {
  throw new Error('Falha ao persistir foto e localização em v2_books');
}
process.stdout.write('Livro com foto e localização: persistido e consultado com sucesso\n');

// Teste de exclusão definitiva de conta (LGPD / Issue #115)
await db.exec('reset role');
const disposableUser = '44444444-4444-4444-8444-444444444444';
await db.exec(`insert into auth.users (id) values ('${disposableUser}')`);
await as('authenticated', disposableUser, `insert into public.v2_books (owner_id, title, author, modality) values ('${disposableUser}', 'Livro do descartável', 'Autor', 'donation')`);
await as('authenticated', disposableUser, `insert into public.v2_favorites (user_id, book_id) values ('${disposableUser}', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`);

await denied('Visitante exclui conta', () => as('anon', null, `select public.delete_user_account('${disposableUser}')`));
await denied('Terceiro tenta excluir conta alheia', () => as('authenticated', other, `select public.delete_user_account('${disposableUser}')`));

await as('authenticated', disposableUser, `select public.delete_user_account('${disposableUser}')`);
const deletedUser = await db.query(`select id from auth.users where id = '${disposableUser}'`);
if (deletedUser.rows.length !== 0) throw new Error('Usuário não foi removido de auth.users');
const cascadedBooks = await db.query(`select id from public.v2_books where owner_id = '${disposableUser}'`);
if (cascadedBooks.rows.length !== 0) throw new Error('Livros do usuário excluído não foram removidos em cascata');
const cascadedFavs = await db.query(`select id from public.v2_favorites where user_id = '${disposableUser}'`);
if (cascadedFavs.rows.length !== 0) throw new Error('Favoritos do usuário excluído não foram removidos em cascata');
process.stdout.write('Exclusão de conta LGPD e cascata: verificado com sucesso\n');

// Teste de Storage para fotos de livros (Spec 023 / Issue #116)
await db.exec('reset role');
await db.exec(`insert into storage.objects (id, bucket_id, name, owner)
  values ('10101010-1010-4010-8010-101010101010', 'book-photos', '${owner}/capa.jpg', '${owner}')`);

// Leitura pública
const publicPhotos = await as('anon', null, `select id from storage.objects where bucket_id = 'book-photos'`);
if (publicPhotos.rows.length !== 1) throw new Error('Fotos de livros não estão visíveis publicamente');
process.stdout.write('Fotos de livros públicas: verificado com sucesso\n');

// Visitante não pode inserir foto
await denied('Visitante envia foto', () => as('anon', null, `insert into storage.objects (bucket_id, name) values ('book-photos', 'qualquer.jpg')`));

// Usuário autenticado não pode inserir foto na pasta de outro usuário
await denied('Usuário envia foto na pasta de outro', () => as('authenticated', reader, `insert into storage.objects (bucket_id, name, owner) values ('book-photos', '${owner}/foto_hacker.jpg', '${reader}')`));

// Usuário autenticado pode inserir foto na sua própria pasta
await as('authenticated', reader, `insert into storage.objects (id, bucket_id, name, owner) values ('20202020-2020-4020-8020-202020202020', 'book-photos', '${reader}/minha_capa.jpg', '${reader}')`);

// Terceiro não pode excluir foto alheia (0 linhas afetadas por RLS)
const forbiddenDelete = await as('authenticated', other, `delete from storage.objects where id = '20202020-2020-4020-8020-202020202020'`);
if (forbiddenDelete.affectedRows !== 0) throw new Error('Terceiro conseguiu excluir foto alheia');
process.stdout.write('Terceiro exclui foto alheia: nenhuma linha alterada\n');

// Proprietário pode excluir sua foto
await as('authenticated', reader, `delete from storage.objects where id = '20202020-2020-4020-8020-202020202020'`);
const remainingPhoto = await db.query(`select id from storage.objects where id = '20202020-2020-4020-8020-202020202020'`);
if (remainingPhoto.rows.length !== 0) throw new Error('Foto não foi removida pelo proprietário');
process.stdout.write('Políticas de Storage book-photos: verificado com sucesso\n');

// Busca textual com extensão pg_trgm e operador ILIKE
const trgmSearch = await as('anon', null, `select id, title, author from public.v2_books where status = 'available' and (title ilike '%Foto%' or author ilike '%Fotográfico%')`);
if (trgmSearch.rows.length === 0) throw new Error('Busca trigram ILIKE não encontrou o livro');
process.stdout.write('Busca textual com pg_trgm e índice GIN: verificado com sucesso\n');

process.stdout.write('Migrações e cenários SQL locais verificados.\n');
await db.close();
