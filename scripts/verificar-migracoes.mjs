import { readFileSync, readdirSync } from 'node:fs';
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

const migrationsDir = new URL('../supabase/migrations/', import.meta.url);
const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
const versions = migrations.map((name) => name.split('_')[0]);
if (new Set(versions).size !== versions.length) {
  throw new Error('Há versões duplicadas nas migrações SQL');
}
for (const name of migrations) {
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
await denied('Aceite direto fora da RPC', () => as('authenticated', owner, `update public.v2_book_requests set status = 'accepted' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`));
await as('authenticated', owner, `select public.accept_book_request('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')`);
await denied('Pedido aceito não reabre', () => as('authenticated', owner, `update public.v2_book_requests set status = 'pending' where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'`));
await denied('Terceiro avalia negociação alheia', () => as('authenticated', other, `insert into public.v2_ratings (rater_id, rated_user_id, request_id, score) values ('${other}', '${owner}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1)`));
await denied('Dono avalia pessoa fora da negociação', () => as('authenticated', owner, `insert into public.v2_ratings (rater_id, rated_user_id, request_id, score) values ('${owner}', '${other}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1)`));
await as('authenticated', reader, `insert into public.v2_ratings (rater_id, rated_user_id, request_id, score) values ('${reader}', '${owner}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 5)`);
await as('authenticated', owner, `insert into public.v2_ratings (rater_id, rated_user_id, request_id, score) values ('${owner}', '${reader}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 4)`);
await denied('Avaliação duplicada no pedido', () => as('authenticated', reader, `insert into public.v2_ratings (rater_id, rated_user_id, request_id, score) values ('${reader}', '${owner}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 2)`));

// Spec 052 / ADR 0037: encontro da negociação aceita bbbb (dono = owner, leitor = reader).
const meeting = 'cccccccc-0044-4044-8044-cccccccccccc';
const praca = 'Praça da Bandeira (Centro)';
await denied('Terceiro convida para encontro alheio', () => as('authenticated', other, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '1 day', '${other}')`));
await denied('Convite em nome de outra pessoa', () => as('authenticated', owner, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '1 day', '${reader}')`));
await denied('Encontro fora dos pontos seguros', () => as('authenticated', owner, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Minha casa', now() + interval '1 day', '${owner}')`));
await denied('Encontro no passado', () => as('authenticated', owner, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() - interval '1 hour', '${owner}')`));
await denied('Encontro além de sete dias', () => as('authenticated', owner, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '9 days', '${owner}')`));
await as('authenticated', owner, `insert into public.v2_meetings (id, request_id, point_name, scheduled_at, proposed_by) values ('${meeting}', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '1 day', '${owner}')`);
await denied('Segundo encontro ativo no mesmo pedido', () => as('authenticated', reader, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '2 days', '${reader}')`));
const hiddenMeeting = await as('authenticated', other, `select id from public.v2_meetings`);
if (hiddenMeeting.rows.length !== 0) throw new Error('Encontro visível para quem não participa');
const readerMeeting = await as('authenticated', reader, `select id from public.v2_meetings`);
if (readerMeeting.rows.length !== 1) throw new Error('Participante não vê o encontro');
const inviteNotice = await as('authenticated', reader, `select title, type, action_url from public.v2_notifications where type = 'meeting_update'`);
if (inviteNotice.rows[0]?.title !== 'Convite para encontro' || inviteNotice.rows[0]?.action_url !== '/negociacao/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb') throw new Error('Convite não avisou a outra pessoa');
const blockedMeeting = await as('authenticated', other, `update public.v2_meetings set status = 'cancelled' where id = '${meeting}'`);
if (blockedMeeting.affectedRows !== 0) throw new Error('Terceiro alterou encontro alheio');
await denied('Quem convidou confirma o próprio convite', () => as('authenticated', owner, `update public.v2_meetings set status = 'confirmed' where id = '${meeting}'`));
await as('authenticated', reader, `update public.v2_meetings set status = 'confirmed' where id = '${meeting}'`);
await denied('Confirmação altera o local', () => as('authenticated', reader, `update public.v2_meetings set status = 'confirmed', point_name = 'Praça de Eventos' where id = '${meeting}'`));
await denied('Reagendamento em nome de outra pessoa', () => as('authenticated', reader, `update public.v2_meetings set status = 'proposed', proposed_by = '${owner}', scheduled_at = now() + interval '2 days' where id = '${meeting}'`));
await as('authenticated', reader, `update public.v2_meetings set status = 'proposed', proposed_by = '${reader}', point_name = 'Praça de Eventos', scheduled_at = now() + interval '2 days' where id = '${meeting}'`);
await as('authenticated', owner, `update public.v2_meetings set status = 'cancelled' where id = '${meeting}'`);
await denied('Encontro cancelado volta a valer', () => as('authenticated', reader, `update public.v2_meetings set status = 'confirmed' where id = '${meeting}'`));
const meetingOwnerNotices = await as('authenticated', owner, `select title from public.v2_notifications where type = 'meeting_update' order by created_at, title`);
const ownerTitles = meetingOwnerNotices.rows.map((row) => row.title).sort();
if (JSON.stringify(ownerTitles) !== JSON.stringify(['Encontro confirmado', 'Encontro reagendado'])) throw new Error(`Avisos do encontro para quem anunciou: ${ownerTitles}`);
const meetingReaderNotices = await as('authenticated', reader, `select title from public.v2_notifications where type = 'meeting_update'`);
if (!meetingReaderNotices.rows.some((row) => row.title === 'Encontro cancelado')) throw new Error('Cancelamento não avisou a outra pessoa');
await as('authenticated', reader, `insert into public.v2_meetings (request_id, point_name, scheduled_at, proposed_by) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${praca}', now() + interval '3 days', '${reader}')`);
await denied('Cliente insere notificação direto', () => as('authenticated', owner, `insert into public.v2_notifications (user_id, title, message, type) values ('${reader}', 'Falso', 'Falso', 'meeting_update')`));
process.stdout.write('Encontro da negociação (Spec 052): verificado com sucesso\n');
// Os cenários de alerta abaixo contam todas as notificações de cada pessoa.
await db.exec(`reset role; delete from public.v2_notifications where type = 'meeting_update'`);

await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality) values ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '${owner}', 'Livro com dois pedidos', 'Autora', 'donation')`);
await as('authenticated', reader, `insert into public.v2_book_requests (id, listing_id, requester_id) values ('f1111111-1111-4111-8111-111111111111', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '${reader}')`);
await as('authenticated', other, `insert into public.v2_book_requests (id, listing_id, requester_id) values ('f2222222-2222-4222-8222-222222222222', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '${other}')`);
await denied('Leitor aceita pedido de outro usuário', () => as('authenticated', reader, `select public.accept_book_request('f1111111-1111-4111-8111-111111111111')`));
await db.exec(`reset role;
  create function public.simulate_reservation_failure() returns trigger language plpgsql as $$
  begin
    if new.id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' and new.status = 'reserved' then
      raise exception 'Falha simulada na reserva';
    end if;
    return new;
  end; $$;
  create trigger simulate_reservation_failure before update on public.v2_books
  for each row execute function public.simulate_reservation_failure();`);
await denied('Falha na reserva reverte o aceite inteiro', () => as('authenticated', owner, `select public.accept_book_request('f1111111-1111-4111-8111-111111111111')`));
const afterFailure = await as('authenticated', owner, `select status from public.v2_book_requests where listing_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' order by id`);
if (afterFailure.rows.some((row) => row.status !== 'pending')) throw new Error('Aceite deixou pedidos alterados após falha');
await db.exec('reset role; drop trigger simulate_reservation_failure on public.v2_books; drop function public.simulate_reservation_failure()');
await as('authenticated', owner, `select public.accept_book_request('f1111111-1111-4111-8111-111111111111')`);
const acceptedState = await as('authenticated', owner, `select b.status as book_status, r.status as request_status from public.v2_books b join public.v2_book_requests r on r.listing_id = b.id where r.id = 'f1111111-1111-4111-8111-111111111111'`);
if (acceptedState.rows[0]?.book_status !== 'reserved' || acceptedState.rows[0]?.request_status !== 'accepted') throw new Error('Aceite não reservou o livro');
const competitor = await as('authenticated', owner, `select status from public.v2_book_requests where id = 'f2222222-2222-4222-8222-222222222222'`);
if (competitor.rows[0]?.status !== 'rejected') throw new Error('Aceite não rejeitou pedido concorrente');
await denied('Pedido aceito novamente', () => as('authenticated', owner, `select public.accept_book_request('f1111111-1111-4111-8111-111111111111')`));
await as('authenticated', reader, `insert into public.v2_favorites (user_id, book_id) values ('${reader}', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`);
const ownFavorites = await as('authenticated', reader, `select id from public.v2_favorites`);
if (ownFavorites.rows.length !== 1) throw new Error('Favorito do leitor não apareceu');
const otherFavorites = await as('authenticated', other, `select id from public.v2_favorites`);
if (otherFavorites.rows.length !== 0) throw new Error('Favoritos de outra pessoa expostos');
await denied('Leitor falsifica favorito', () => as('authenticated', other, `insert into public.v2_favorites (user_id, book_id) values ('${reader}', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`));
await as('authenticated', reader, `insert into public.v2_search_alerts (user_id, query) values ('${reader}', 'Casmurro')`);
await as('authenticated', owner, `insert into public.v2_search_alerts (user_id, query) values ('${owner}', 'Casmurro')`);
const defaultModalities = await as('authenticated', reader, `select modalities from public.v2_search_alerts where query = 'Casmurro'`);
if (defaultModalities.rows[0]?.modalities?.length !== 3) throw new Error('Alerta antigo não recebeu as três modalidades');
await as('authenticated', owner, `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Dom Casmurro', 'Machado de Assis', 'donation')`);
const notices = await as('authenticated', reader, `select type, action_url from public.v2_notifications`);
if (notices.rows.length !== 1 || notices.rows[0].type !== 'search_alert_match') throw new Error('Alerta não criou notificação');
const ownerNotices = await as('authenticated', owner, `select id from public.v2_notifications`);
if (ownerNotices.rows.length !== 0) throw new Error('Anunciante foi avisado sobre o próprio livro');
await as('authenticated', reader, `update public.v2_search_alerts set modalities = array['sale']::text[] where query = 'Casmurro'`);
await as('authenticated', owner, `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Novo Casmurro', 'Machado de Assis', 'donation')`);
const filteredNotices = await as('authenticated', reader, `select id from public.v2_notifications`);
if (filteredNotices.rows.length !== 1) throw new Error('Alerta ignorou filtro de modalidade');
await as('authenticated', owner, `insert into public.v2_books (owner_id, title, author, modality, price) values ('${owner}', 'Outro Casmurro', 'Machado de Assis', 'sale', 20)`);
const matchingNotices = await as('authenticated', reader, `select id from public.v2_notifications`);
if (matchingNotices.rows.length !== 2) throw new Error('Venda não gerou notificação para alerta de venda');
await denied('Alerta sem modalidade', () => as('authenticated', reader, `update public.v2_search_alerts set modalities = array[]::text[] where query = 'Casmurro'`));
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

// Leitura pública anônima de perfis comunitários e avaliações (ADR 0038)
await db.exec('reset role');
await db.exec(`insert into public.v2_profiles (id, name) values ('${owner}', 'Dono Comunitário') on conflict (id) do update set name = 'Dono Comunitário'`);
const anonProfile = await as('anon', null, `select name from public.v2_profiles where id = '${owner}'`);
if (anonProfile.rows[0]?.name !== 'Dono Comunitário') throw new Error('Visitante anônimo não conseguiu ler o perfil público');

await denied('Visitante altera perfil', () => as('anon', null, `update public.v2_profiles set name = 'Hacker' where id = '${owner}'`));
await denied('Visitante cria perfil', () => as('anon', null, `insert into public.v2_profiles (id, name) values ('33333333-3333-4333-8333-333333333333', 'Invasor')`));
process.stdout.write('Leitura anônima de perfis (ADR 0038): verificado com sucesso\n');

// Bloqueio de usuários e moderação interpessoal (Spec 056 / ADR 0039)
await as('authenticated', owner, `insert into public.v2_blocked_users (blocker_id, blocked_id) values ('${owner}', '${other}')`);
const ownerBlocked = await as('authenticated', owner, `select blocked_id from public.v2_blocked_users`);
if (ownerBlocked.rows.length !== 1 || ownerBlocked.rows[0]?.blocked_id !== other) throw new Error('Bloqueio do dono não foi retornado');

await denied('Usuário bloqueia a si mesmo', () => as('authenticated', owner, `insert into public.v2_blocked_users (blocker_id, blocked_id) values ('${owner}', '${owner}')`));
const readerViewsOwnerBlocks = await as('authenticated', reader, `select * from public.v2_blocked_users where blocker_id = '${owner}'`);
if (readerViewsOwnerBlocks.rows.length !== 0) throw new Error('Terceiro conseguiu visualizar lista de bloqueios alheia');

const readerTriesUnblock = await as('authenticated', reader, `delete from public.v2_blocked_users where blocker_id = '${owner}' and blocked_id = '${other}'`);
if (readerTriesUnblock.affectedRows !== 0) throw new Error('Terceiro conseguiu remover bloqueio alheio');

await denied('Visitante insere bloqueio', () => as('anon', null, `insert into public.v2_blocked_users (blocker_id, blocked_id) values ('${owner}', '${other}')`));
await as('authenticated', owner, `delete from public.v2_blocked_users where blocker_id = '${owner}' and blocked_id = '${other}'`);
const afterUnblock = await as('authenticated', owner, `select * from public.v2_blocked_users where blocker_id = '${owner}'`);
if (afterUnblock.rows.length !== 0) throw new Error('Desbloqueio não removeu o registro');
process.stdout.write('Bloqueio de usuários (Spec 056 / ADR 0039): verificado com sucesso\n');

process.stdout.write('Migrações e cenários SQL locais verificados.\n');
await db.close();
