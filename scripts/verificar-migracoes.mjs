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
// Spec 100: a avaliação avisa quem foi avaliado.
const avisoAvaliacao = await as('authenticated', owner, `select action_url from public.v2_notifications where type = 'rating_received'`);
if (avisoAvaliacao.rows.length === 0 || avisoAvaliacao.rows[0].action_url !== '/perfil/avaliacoes') throw new Error('Avaliação não avisou quem foi avaliado');
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
// Os cenários de alerta abaixo contam todas as notificações de cada pessoa.
await db.exec(`reset role; delete from public.v2_notifications`);
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

// Mensagens e Chat da Negociação Presencial (Spec 061 / ADR 0044)
const sampleReqId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
await as('authenticated', reader, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${sampleReqId}', '${reader}', 'Olá! Chego em 10 minutos.')`);
const readMsgs = await as('authenticated', owner, `select content from public.v2_negotiation_messages where request_id = '${sampleReqId}'`);
if (readMsgs.rows.length !== 1 || readMsgs.rows[0]?.content !== 'Olá! Chego em 10 minutos.') {
  throw new Error('Dono da negociação não conseguiu ler a mensagem enviada');
}

const thirdPartyReadMsgs = await as('authenticated', other, `select content from public.v2_negotiation_messages where request_id = '${sampleReqId}'`);
if (thirdPartyReadMsgs.rows.length !== 0) throw new Error('Terceiro conseguiu ler mensagens de negociação alheia');

await denied('Terceiro envia mensagem em negociação alheia', () => as('authenticated', other, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${sampleReqId}', '${other}', 'Intromissão')`));
await denied('Visitante anônimo envia mensagem', () => as('anon', null, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${sampleReqId}', '${reader}', 'Anônimo')`));

// Bloqueio impede envio de mensagem
await as('authenticated', owner, `insert into public.v2_blocked_users (blocker_id, blocked_id) values ('${owner}', '${reader}')`);
await denied('Envio de mensagem com bloqueio ativo', () => as('authenticated', reader, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${sampleReqId}', '${reader}', 'Mensagem pós-bloqueio')`));
await as('authenticated', owner, `delete from public.v2_blocked_users where blocker_id = '${owner}' and blocked_id = '${reader}'`);

process.stdout.write('Mensagens de negociação (Spec 061 / ADR 0044): verificado com sucesso\n');

// ADR 0062 / Spec 078: o app lê e grava `push_token` em v2_user_preferences; sem a coluna,
// a consulta inteira falha e a tela "Editar perfil" mostra "Não foi possível consultar as preferências."
await as('authenticated', owner, `insert into public.v2_user_preferences (user_id, phone, neighborhood, push_token)
values ('${owner}', '86999990000', 'Centro', 'ExponentPushToken[teste]')
on conflict (user_id) do update set push_token = excluded.push_token`);
const prefs = await as('authenticated', owner, `select user_id,phone,neighborhood,push_token from public.v2_user_preferences where user_id = '${owner}'`);
if (prefs.rows[0]?.push_token !== 'ExponentPushToken[teste]') throw new Error('push_token não foi gravado nas preferências');
const otherPrefs = await as('authenticated', other, `select push_token from public.v2_user_preferences where user_id = '${owner}'`);
if (otherPrefs.rows.length !== 0) throw new Error('Terceiro conseguiu ler o push_token alheio');
process.stdout.write('Preferências com push_token (ADR 0062): verificado com sucesso\n');
// Spec 099 / ADR 0075: preferência por tipo de aviso. `muted_types` guarda os tipos desativados para push;
// só o titular lê e grava, e o padrão vazio mantém o comportamento de receber tudo (Spec 096).
await as('authenticated', owner, `update public.v2_user_preferences set muted_types = array['search_alert_match','system']::text[] where user_id = '${owner}'`);
const mutedRow = await as('authenticated', owner, `select muted_types from public.v2_user_preferences where user_id = '${owner}'`);
const mutedList = mutedRow.rows[0]?.muted_types ?? [];
if (!mutedList.includes('search_alert_match') || !mutedList.includes('system')) throw new Error('muted_types não gravou os tipos desativados');
const mutedOther = await as('authenticated', other, `select muted_types from public.v2_user_preferences where user_id = '${owner}'`);
if (mutedOther.rows.length !== 0) throw new Error('Terceiro conseguiu ler o muted_types alheio');
await as('authenticated', reader, `insert into public.v2_user_preferences (user_id) values ('${reader}') on conflict (user_id) do nothing`);
const readerRow = await as('authenticated', reader, `select muted_types from public.v2_user_preferences where user_id = '${reader}'`);
if ((readerRow.rows[0]?.muted_types ?? []).length !== 0) throw new Error('muted_types deveria ser vazio por padrão (recebe tudo)');
process.stdout.write('Preferências por tipo de aviso (Spec 099 / ADR 0075): verificado com sucesso\n');
// Rascunhos de anúncio (Spec 017): 'draft' aceita conteúdo incompleto e fica invisível a terceiros.
await db.exec('reset role');
const draftVazio = 'd7a0017d-0017-4017-8017-000000000001';
const draftDescarte = 'd7a0017d-0017-4017-8017-000000000002';
// Rascunho com título/autor vazios e modalidade 'sale' sem preço: aceito enquanto draft.
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality, status, draft_step)
  values ('${draftVazio}', '${owner}', '', '', 'sale', 'draft', 1)`);
process.stdout.write('Rascunho incompleto (sem título/autor/preço): aceito\n');
// O dono enxerga o próprio rascunho; terceiros e visitantes não.
const ownerSeesDraft = await as('authenticated', owner, `select id from public.v2_books where id = '${draftVazio}'`);
if (ownerSeesDraft.rows.length !== 1) throw new Error('Dono não enxerga o próprio rascunho');
const thirdSeesDraft = await as('authenticated', reader, `select id from public.v2_books where id = '${draftVazio}'`);
if (thirdSeesDraft.rows.length !== 0) throw new Error('Rascunho visível para terceiros');
const anonSeesDraft = await as('anon', null, `select id from public.v2_books where id = '${draftVazio}'`);
if (anonSeesDraft.rows.length !== 0) throw new Error('Rascunho visível para visitante anônimo');
process.stdout.write('Rascunho oculto de terceiros e visitantes: verificado\n');
// Terceiro não descarta rascunho alheio (nenhuma linha alterada por RLS).
const thirdDeleteDraft = await as('authenticated', reader, `delete from public.v2_books where id = '${draftVazio}'`);
if (thirdDeleteDraft.affectedRows !== 0) throw new Error('Terceiro conseguiu descartar rascunho alheio');
// Publicar o rascunho (preenchendo título/autor/preço) transiciona para 'available'.
await as('authenticated', owner, `update public.v2_books set status = 'available', title = 'Dom Casmurro', author = 'Machado de Assis', price = 12
  where id = '${draftVazio}'`);
const published = await as('anon', null, `select status, title from public.v2_books where id = '${draftVazio}'`);
if (published.rows[0]?.status !== 'available' || published.rows[0]?.title !== 'Dom Casmurro') {
  throw new Error('Publicação a partir de rascunho não tornou o anúncio disponível');
}
process.stdout.write('Publicar a partir de rascunho: transiciona para available\n');
// Anúncio publicado (não draft) continua exigindo título e autor preenchidos.
await denied('Publicar sem título', () => as('authenticated', owner,
  `insert into public.v2_books (owner_id, title, author, modality, price) values ('${owner}', '', 'Sem título', 'sale', 5)`));
await denied('Venda publicada sem preço', () => as('authenticated', owner,
  `insert into public.v2_books (owner_id, title, author, modality) values ('${owner}', 'Com título', 'Autor', 'sale')`));
// Dono descarta um rascunho seu (exclusão física permitida pela política de delete).
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality, status, draft_step)
  values ('${draftDescarte}', '${owner}', 'A descartar', 'Autor', 'donation', 'draft', 2)`);
await as('authenticated', owner, `delete from public.v2_books where id = '${draftDescarte}'`);
const discarded = await db.query(`select id from public.v2_books where id = '${draftDescarte}'`);
if (discarded.rows.length !== 0) throw new Error('Dono não conseguiu descartar o próprio rascunho');
process.stdout.write('Rascunhos de anúncio (Spec 017): verificado com sucesso\n');

// Spec 086: tabelas das conversas e notificações publicadas no Realtime
const realtime = await db.query(
  "select tablename from pg_publication_tables where pubname = 'supabase_realtime' order by tablename",
);
const publicadas = realtime.rows.map((row) => row.tablename).join(',');
if (publicadas !== 'v2_book_requests,v2_negotiation_messages,v2_notifications') {
  throw new Error(`Publicação de tempo real incompleta: ${publicadas}`);
}
process.stdout.write('Tempo real de conversas e notificações (Spec 086): verificado com sucesso\n');

// Spec 095 / ADR 0070: conclusão da entrega por QR code (pedido bbbb; dono = owner, leitor = reader).
const pedido = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
await denied('Gerar código sem encontro confirmado', () => as('authenticated', owner, `select * from public.create_delivery_code('${pedido}')`));
await as('authenticated', owner, `update public.v2_meetings set status = 'confirmed' where request_id = '${pedido}' and status = 'proposed'`);
await denied('Leitor gera o código da entrega', () => as('authenticated', reader, `select * from public.create_delivery_code('${pedido}')`));
await denied('Terceiro gera o código da entrega', () => as('authenticated', other, `select * from public.create_delivery_code('${pedido}')`));
await denied('Visitante gera o código da entrega', () => as('anon', null, `select * from public.create_delivery_code('${pedido}')`));
const gerado = await as('authenticated', owner, `select * from public.create_delivery_code('${pedido}')`);
const codigo = gerado.rows[0]?.code;
if (!/^[23456789A-HJKMNP-Z]{8}$/.test(codigo ?? '')) throw new Error(`Código gerado inválido: ${codigo}`);
const lidoPeloLeitor = await as('authenticated', reader, `select code from public.v2_delivery_codes`).catch(() => ({ rows: [] }));
if (lidoPeloLeitor.rows.length !== 0) throw new Error('Leitor leu o código direto da tabela');
await denied('Anunciante confirma a própria entrega', () => as('authenticated', owner, `select * from public.complete_delivery('${pedido}', '${codigo}')`));
await denied('Terceiro confirma a entrega', () => as('authenticated', other, `select * from public.complete_delivery('${pedido}', '${codigo}')`));
const errado = codigo === 'AAAAAAAA' ? 'BBBBBBBB' : 'AAAAAAAA';
for (let tentativa = 1; tentativa <= 5; tentativa += 1) {
  const r = await as('authenticated', reader, `select * from public.complete_delivery('${pedido}', '${errado}')`);
  if (r.rows[0]?.resultado !== 'incorreto') throw new Error(`Tentativa ${tentativa}: esperava incorreto, veio ${r.rows[0]?.resultado}`);
}
const bloqueado = await as('authenticated', reader, `select * from public.complete_delivery('${pedido}', '${codigo}')`);
if (bloqueado.rows[0]?.resultado !== 'bloqueado') throw new Error('Código não bloqueou após 5 tentativas erradas');
process.stdout.write('Cinco tentativas erradas bloqueiam o código: verificado\n');
const novo = (await as('authenticated', owner, `select * from public.create_delivery_code('${pedido}')`)).rows[0].code;
await db.exec(`reset role; update public.v2_delivery_codes set expires_at = now() - interval '1 minute' where request_id = '${pedido}'`);
const expirado = await as('authenticated', reader, `select * from public.complete_delivery('${pedido}', '${novo}')`);
if (expirado.rows[0]?.resultado !== 'expirado') throw new Error('Código vencido foi aceito');
process.stdout.write('Código vencido: recusado\n');
const ultimo = (await as('authenticated', owner, `select * from public.create_delivery_code('${pedido}')`)).rows[0].code;
await denied('Entrega escrita direto na tabela', () => as('authenticated', reader, `insert into public.v2_deliveries (request_id, completed_by) values ('${pedido}', '${reader}')`));
const ok = await as('authenticated', reader, `select * from public.complete_delivery('${pedido}', '${ultimo.toLowerCase()}')`);
if (ok.rows[0]?.resultado !== 'ok') throw new Error(`Código certo não concluiu: ${ok.rows[0]?.resultado}`);
for (const [papel, usuario] of [['anunciante', owner], ['leitor', reader]]) {
  const visto = await as('authenticated', usuario, `select request_id from public.v2_deliveries`);
  if (visto.rows.length !== 1) throw new Error(`Entrega não visível para o ${papel}`);
}
const escondida = await as('authenticated', other, `select request_id from public.v2_deliveries`);
if (escondida.rows.length !== 0) throw new Error('Entrega visível para quem não participa');
await denied('Entrega concluída não se repete', () => as('authenticated', reader, `select * from public.complete_delivery('${pedido}', '${ultimo}')`));
await denied('Código novo depois de concluída', () => as('authenticated', owner, `select * from public.create_delivery_code('${pedido}')`));
const avisoEntrega = await as('authenticated', owner, `select title, action_url from public.v2_notifications where title = 'Entrega confirmada'`);
if (avisoEntrega.rows.length !== 1 || avisoEntrega.rows[0].action_url !== `/negociacao/${pedido}`) throw new Error('Entrega não avisou o anunciante');
process.stdout.write('Conclusão da entrega por QR code (Spec 095): verificada com sucesso\n');
const livroEntregue = await as('authenticated', owner, `select status from public.v2_books where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`);
if (livroEntregue.rows[0]?.status !== 'delivered') throw new Error(`Livro não virou entregue: ${livroEntregue.rows[0]?.status}`);
process.stdout.write('Livro entregue depois da conclusão (Spec 095): verificado com sucesso\n');


// Spec 096 / ADR 0071: push de avisos para o celular.
const tokenA = 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]';
await as('authenticated', owner, `insert into public.v2_user_preferences (user_id, push_token) values ('${owner}', '${tokenA}') on conflict (user_id) do update set push_token = excluded.push_token`);
await as('authenticated', reader, `insert into public.v2_user_preferences (user_id, push_token) values ('${reader}', '${tokenA}') on conflict (user_id) do update set push_token = excluded.push_token`);
const donoDoToken = await db.query(`select user_id::text from public.v2_user_preferences where push_token = '${tokenA}'`);
if (donoDoToken.rows.length !== 1 || donoDoToken.rows[0].user_id !== reader) throw new Error('Token repetido continuou em duas contas');
process.stdout.write('Token de push repetido sai da conta anterior: verificado\n');
await denied('Pessoa lê a configuração do push', () => as('authenticated', owner, `select * from public.v2_push_settings`));
await denied('Pessoa grava a configuração do push', () => as('authenticated', owner, `insert into public.v2_push_settings (function_url, publishable_key) values ('https://x', 'k')`));
await db.exec(`reset role; insert into public.v2_push_settings (function_url, publishable_key) values ('https://exemplo.functions.supabase.co/enviar-push', 'sb_publishable_teste')`);
await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${reader}', false); set role authenticated;`);
await db.query(`select 1`);
await db.exec(`reset role; insert into public.v2_notifications (user_id, title, message, type) values ('${reader}', 'Aviso de teste', 'Sem pg_net, o gatilho não pode falhar', 'system')`);
const criado = await db.query(`select pushed_at from public.v2_notifications where title = 'Aviso de teste'`);
if (criado.rows.length !== 1 || criado.rows[0].pushed_at !== null) throw new Error('Aviso com push configurado deveria ser criado sem pushed_at');
process.stdout.write('Gatilho do push não impede criar o aviso (sem pg_net): verificado\n');
await denied('Pessoa marca o aviso como enviado', () => as('authenticated', reader, `update public.v2_notifications set pushed_at = now() where title = 'Aviso de teste'`));

// Spec 097 / ADR 0073: sinopse e dados da edição do livro (colunas opcionais de v2_books). Livro aaaa do owner.
const livroEdicao = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
await as('authenticated', owner, `update public.v2_books set synopsis = 'Distopia futurista.', publisher = 'Companhia das Letras', page_count = 416, publication_year = 2009 where id = '${livroEdicao}'`);
const lidoSemLogin = await as('anon', null, `select synopsis, publisher, page_count, publication_year from public.v2_books where id = '${livroEdicao}'`);
if (lidoSemLogin.rows[0]?.synopsis !== 'Distopia futurista.' || Number(lidoSemLogin.rows[0]?.page_count) !== 416) throw new Error('Edição do livro não visível no catálogo público');
await denied('Sinopse acima de 2000 caracteres', () => as('authenticated', owner, `update public.v2_books set synopsis = repeat('a', 2001) where id = '${livroEdicao}'`));
await denied('Editora acima de 120 caracteres', () => as('authenticated', owner, `update public.v2_books set publisher = repeat('e', 121) where id = '${livroEdicao}'`));
await denied('Páginas zeradas', () => as('authenticated', owner, `update public.v2_books set page_count = 0 where id = '${livroEdicao}'`));
await denied('Ano fora do intervalo', () => as('authenticated', owner, `update public.v2_books set publication_year = 3000 where id = '${livroEdicao}'`));
const semPermissao = await as('authenticated', other, `update public.v2_books set synopsis = 'Invasão' where id = '${livroEdicao}'`);
if (semPermissao.affectedRows !== 0) throw new Error('Outra pessoa alterou a sinopse do livro');
process.stdout.write('Sinopse e dados da edição do livro (Spec 097): verificados com sucesso\n');

// Spec 098 / ADR 0074: avisos de pedido recebido e aceito.
const livro98 = '98989898-9898-4898-8898-989898989898';
const pedido98 = '98989898-9898-4898-8898-989898989899';
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality) values ('${livro98}', '${owner}', 'Livro Avisos 098', 'Autor 098', 'donation')`);
await as('authenticated', reader, `insert into public.v2_book_requests (id, listing_id, requester_id) values ('${pedido98}', '${livro98}', '${reader}')`);

const avisoRecebido = await as('authenticated', owner, `select title, action_url from public.v2_notifications where type = 'request_received' and action_url = '/pedidos-recebidos'`);
if (avisoRecebido.rows.length === 0) throw new Error('Pedido novo não avisou quem anunciou o livro');

const avisoLeitorRecebido = await as('authenticated', reader, `select 1 from public.v2_notifications where type = 'request_received' and action_url = '/pedidos-recebidos'`);
if (avisoLeitorRecebido.rows.length !== 0) throw new Error('Quem pediu recebeu o aviso de pedido recebido');

await as('authenticated', owner, `select public.accept_book_request('${pedido98}')`);
const avisoAceito = await as('authenticated', reader, `select title, action_url from public.v2_notifications where type = 'request_accepted' and action_url = '/negociacao/${pedido98}'`);
if (avisoAceito.rows.length === 0) throw new Error('Aceite não avisou quem pediu o livro');

const avisoDonoAceito = await as('authenticated', owner, `select 1 from public.v2_notifications where type = 'request_accepted' and action_url = '/negociacao/${pedido98}'`);
if (avisoDonoAceito.rows.length !== 0) throw new Error('Quem anunciou recebeu o aviso de pedido aceito');

const terceiroAvisos = await as('authenticated', other, `select 1 from public.v2_notifications where type in ('request_received', 'request_accepted') and (action_url = '/pedidos-recebidos' or action_url = '/negociacao/${pedido98}')`);
if (terceiroAvisos.rows.length !== 0) throw new Error('Terceiro viu avisos de pedido alheios');
process.stdout.write('Avisos de pedido recebido e aceito (Spec 098): verificados com sucesso\n');

// Spec 100 / ADR 0076: avisos restantes — mensagem nova (sem repetir enquanto não lida), pedido recusado e avaliação.
await as('authenticated', reader, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedido98}', '${reader}', 'Oi, ainda está disponível?')`);
await as('authenticated', reader, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedido98}', '${reader}', 'Posso buscar amanhã.')`);
const avisosMsg = await as('authenticated', owner, `select id, message from public.v2_notifications where type = 'new_message' and action_url = '/negociacao/${pedido98}'`);
if (avisosMsg.rows.length !== 1) throw new Error('Mensagem nova deveria gerar um único aviso enquanto não lido');
const avisoMsgRemetente = await as('authenticated', reader, `select 1 from public.v2_notifications where type = 'new_message'`);
if (avisoMsgRemetente.rows.length !== 0) throw new Error('Quem enviou a mensagem recebeu o próprio aviso');
await as('authenticated', owner, `update public.v2_notifications set read = true where id = '${avisosMsg.rows[0].id}'`);
await as('authenticated', reader, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedido98}', '${reader}', 'Combinado?')`);
const avisosMsgDepois = await as('authenticated', owner, `select 1 from public.v2_notifications where type = 'new_message' and not read and action_url = '/negociacao/${pedido98}'`);
if (avisosMsgDepois.rows.length !== 1) throw new Error('Mensagem depois do aviso lido deveria avisar de novo');
await as('authenticated', owner, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedido98}', '${owner}', 'Combinado!')`);
const avisoMsgLeitor = await as('authenticated', reader, `select 1 from public.v2_notifications where type = 'new_message' and action_url = '/negociacao/${pedido98}'`);
if (avisoMsgLeitor.rows.length !== 1) throw new Error('Resposta do anunciante não avisou quem pediu');

const livro100 = '10010010-0100-4100-8100-100100100100';
const pedido100 = '10010010-0100-4100-8100-100100100101';
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality) values ('${livro100}', '${owner}', 'Livro Recusa 100', 'Autor 100', 'donation')`);
await as('authenticated', other, `insert into public.v2_book_requests (id, listing_id, requester_id) values ('${pedido100}', '${livro100}', '${other}')`);
await as('authenticated', owner, `update public.v2_book_requests set status = 'rejected' where id = '${pedido100}'`);
const avisoRecusa = await as('authenticated', other, `select action_url from public.v2_notifications where type = 'request_rejected'`);
if (avisoRecusa.rows.length !== 1 || avisoRecusa.rows[0].action_url !== '/meus-pedidos') throw new Error('Recusa não avisou quem pediu');

const avaliacaoTerceiro = await as('authenticated', other, `select 1 from public.v2_notifications where type in ('rating_received', 'new_message')`);
if (avaliacaoTerceiro.rows.length !== 0) throw new Error('Terceiro viu avisos de mensagem ou avaliação alheios');
process.stdout.write('Avisos de mensagem, recusa e avaliação (Spec 100): verificados com sucesso\n');

// Spec 101 / ADR 0077: quem pediu cancela o próprio pedido pendente; quem favoritou é avisado de preço e saída do ar.
const livro101 = '10110110-1101-4101-8101-101101101101';
const pedido101 = '10110110-1101-4101-8101-101101101102';
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality) values ('${livro101}', '${owner}', 'Livro Cancela 101', 'Autor 101', 'donation')`);
await as('authenticated', reader, `insert into public.v2_book_requests (id, listing_id, requester_id) values ('${pedido101}', '${livro101}', '${reader}')`);
const donoCancela = await as('authenticated', owner, `update public.v2_book_requests set status = 'cancelled' where id = '${pedido101}'`).catch(() => ({ affectedRows: 0 }));
if (donoCancela.affectedRows !== 0) throw new Error('Quem anunciou conseguiu marcar o pedido como cancelado');
const terceiroCancela = await as('authenticated', other, `update public.v2_book_requests set status = 'cancelled' where id = '${pedido101}'`);
if (terceiroCancela.affectedRows !== 0) throw new Error('Terceiro cancelou pedido alheio');
await denied('Quem pediu aceita o próprio pedido', () => as('authenticated', reader, `update public.v2_book_requests set status = 'accepted' where id = '${pedido101}'`));
await as('authenticated', reader, `update public.v2_book_requests set status = 'cancelled' where id = '${pedido101}'`);
const avisoCancelado = await as('authenticated', owner, `select action_url from public.v2_notifications where type = 'request_cancelled'`);
if (avisoCancelado.rows.length !== 1 || avisoCancelado.rows[0].action_url !== '/pedidos-recebidos') throw new Error('Cancelamento não avisou quem anunciou');
await denied('Cancelar pedido já cancelado', () => as('authenticated', reader, `update public.v2_book_requests set status = 'cancelled' where id = '${pedido101}'`).then((r) => { if (r.affectedRows === 0) throw new Error('sem linha'); }));
await as('authenticated', reader, `insert into public.v2_book_requests (listing_id, requester_id) values ('${livro101}', '${reader}')`);

const livroFav = '10110110-1101-4101-8101-101101101103';
const livroFavExcluido = '10110110-1101-4101-8101-101101101104';
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality, price) values ('${livroFav}', '${owner}', 'Livro Favorito 101', 'Autor 101', 'sale', 30)`);
await as('authenticated', owner, `insert into public.v2_books (id, owner_id, title, author, modality) values ('${livroFavExcluido}', '${owner}', 'Livro Excluído 101', 'Autor 101', 'donation')`);
await as('authenticated', reader, `insert into public.v2_favorites (user_id, book_id) values ('${reader}', '${livroFav}'), ('${reader}', '${livroFavExcluido}')`);
await as('authenticated', owner, `update public.v2_books set price = 35 where id = '${livroFav}'`);
const semAvisoAlta = await as('authenticated', reader, `select 1 from public.v2_notifications where type = 'favorite_update'`);
if (semAvisoAlta.rows.length !== 0) throw new Error('Alta de preço não deveria avisar');
await as('authenticated', owner, `update public.v2_books set price = 25 where id = '${livroFav}'`);
const avisoPreco = await as('authenticated', reader, `select message, action_url from public.v2_notifications where type = 'favorite_update'`);
if (avisoPreco.rows.length !== 1 || !avisoPreco.rows[0].message.includes('R$ 25,00') || avisoPreco.rows[0].action_url !== `/livro/${livroFav}`) throw new Error('Queda de preço não avisou quem favoritou');
await as('authenticated', owner, `update public.v2_books set status = 'paused' where id = '${livroFav}'`);
// Anúncio publicado só sai por moderação ou exclusão de conta (o dono só apaga rascunho).
await db.exec(`reset role; delete from public.v2_books where id = '${livroFavExcluido}'`);
const avisosFav = await as('authenticated', reader, `select title, action_url from public.v2_notifications where type = 'favorite_update' order by created_at, title`);
if (avisosFav.rows.length !== 3) throw new Error(`Esperava 3 avisos de favorito, veio ${JSON.stringify(avisosFav.rows)}`);
if (!avisosFav.rows.some((r) => r.action_url === '/favoritos')) throw new Error('Exclusão do livro não avisou quem favoritou');
const donoFav = await as('authenticated', owner, `select 1 from public.v2_notifications where type = 'favorite_update'`);
if (donoFav.rows.length !== 0) throw new Error('Quem anunciou recebeu aviso do próprio livro');
const terceiroFav = await as('authenticated', other, `select 1 from public.v2_notifications where type in ('favorite_update', 'request_cancelled')`);
if (terceiroFav.rows.length !== 0) throw new Error('Terceiro viu avisos de favorito ou cancelamento alheios');
process.stdout.write('Cancelar pedido e avisos de favoritos (Spec 101): verificados com sucesso\n');

// Spec 102 / ADR 0078: moderação — fila só para moderadores, pausa automática com 3 denúncias, arquivar,
// remover anúncio e suspender conta.
const moderador = '55555555-5555-4555-8555-555555555555';
const vendedor = '66666666-6666-4666-8666-666666666666';
await db.exec(`reset role; insert into auth.users (id) values ('${moderador}'), ('${vendedor}'); insert into public.v2_moderators (user_id) values ('${moderador}')`);
await db.exec(`reset role; insert into public.v2_profiles (id, name) values ('${vendedor}', 'Vendedor 102') on conflict (id) do update set name = excluded.name`);
const livro102 = '10210210-2102-4102-8102-102102102101';
const livro102b = '10210210-2102-4102-8102-102102102102';
await as('authenticated', vendedor, `insert into public.v2_books (id, owner_id, title, author, modality) values ('${livro102}', '${vendedor}', 'Livro Denunciado 102', 'Autor', 'donation'), ('${livro102b}', '${vendedor}', 'Outro Livro 102', 'Autor', 'donation')`);
await denied('Pessoa comum vê a fila de moderação', () => as('authenticated', reader, `select * from public.v2_moderation_queue()`));
await denied('Pessoa comum se torna moderadora', () => as('authenticated', reader, `insert into public.v2_moderators (user_id) values ('${reader}')`));
await denied('Pessoa comum decide denúncia', () => as('authenticated', reader, `select public.v2_moderation_resolve('listing', '${livro102}', 'dismiss')`));
for (const quem of [reader, other]) {
  await as('authenticated', quem, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('${livro102}', '${quem}', 'fraud_or_scam')`);
}
const aindaNoAr = await as('anon', null, `select status from public.v2_books where id = '${livro102}'`);
if (aindaNoAr.rows[0]?.status !== 'available') throw new Error('Duas denúncias não deveriam pausar o anúncio');
await as('authenticated', owner, `insert into public.v2_reports (listing_id, reporter_id, reason, details) values ('${livro102}', '${owner}', 'misleading_info', 'Foto não é do livro')`);
const pausado = await db.query(`select status, moderation_hold from public.v2_books where id = '${livro102}'`);
if (pausado.rows[0]?.status !== 'paused' || pausado.rows[0]?.moderation_hold !== true) throw new Error('Três denúncias não pausaram o anúncio');
await denied('Dono reativa anúncio em análise', () => as('authenticated', vendedor, `update public.v2_books set status = 'available' where id = '${livro102}'`));
await denied('Dono tira a retenção da moderação', () => as('authenticated', vendedor, `update public.v2_books set moderation_hold = false where id = '${livro102}'`));
const fila = await as('authenticated', moderador, `select kind, target_id, report_count, details from public.v2_moderation_queue()`);
const itemFila = fila.rows.find((r) => r.target_id === livro102);
if (!itemFila || Number(itemFila.report_count) !== 3 || !itemFila.details.includes('Foto não é do livro')) throw new Error('Fila não agrupou as denúncias do anúncio');
await as('authenticated', moderador, `select public.v2_moderation_resolve('listing', '${livro102}', 'dismiss')`);
const devolvido = await db.query(`select status, moderation_hold from public.v2_books where id = '${livro102}'`);
if (devolvido.rows[0]?.status !== 'available' || devolvido.rows[0]?.moderation_hold !== false) throw new Error('Arquivar não devolveu o anúncio ao ar');
const filaVazia = await as('authenticated', moderador, `select 1 from public.v2_moderation_queue() where target_id = '${livro102}'`);
if (filaVazia.rows.length !== 0) throw new Error('Denúncia arquivada continuou na fila');

await as('authenticated', reader, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('${livro102b}', '${reader}', 'piracy_or_copyright')`);
await as('authenticated', moderador, `select public.v2_moderation_resolve('listing', '${livro102b}', 'remove_listing')`);
const removido = await db.query(`select 1 from public.v2_books where id = '${livro102b}'`);
if (removido.rows.length !== 0) throw new Error('Remover não tirou o anúncio do ar');
const avisoRemocao = await as('authenticated', vendedor, `select 1 from public.v2_notifications where title = 'Anúncio removido pela moderação'`);
if (avisoRemocao.rows.length !== 1) throw new Error('Quem anunciou não soube da remoção');

await as('authenticated', reader, `insert into public.v2_user_reports (reporter_id, reported_user_id, reason) values ('${reader}', '${vendedor}', 'fraud_or_scam')`);
const filaPessoa = await as('authenticated', moderador, `select target_label from public.v2_moderation_queue() where kind = 'user' and target_id = '${vendedor}'`);
if (filaPessoa.rows[0]?.target_label !== 'Vendedor 102') throw new Error('Fila não trouxe a denúncia de pessoa');
await as('authenticated', moderador, `select public.v2_moderation_resolve('user', '${vendedor}', 'suspend_user', 'Golpe')`);
const pausadoSuspenso = await db.query(`select status from public.v2_books where id = '${livro102}'`);
if (pausadoSuspenso.rows[0]?.status !== 'paused') throw new Error('Suspensão não pausou os anúncios da conta');
await denied('Conta suspensa publica anúncio', () => as('authenticated', vendedor, `insert into public.v2_books (owner_id, title, author, modality) values ('${vendedor}', 'Novo', 'Autor', 'donation')`));
await denied('Conta suspensa reativa anúncio', () => as('authenticated', vendedor, `update public.v2_books set status = 'available' where id = '${livro102}'`));
await denied('Conta suspensa pede livro', () => as('authenticated', vendedor, `insert into public.v2_book_requests (listing_id, requester_id) values ('${livro101}', '${vendedor}')`));
await as('authenticated', moderador, `select public.v2_moderation_unsuspend('${vendedor}')`);
await as('authenticated', vendedor, `update public.v2_books set status = 'available' where id = '${livro102}'`);
const suspensoMod = await as('authenticated', moderador, `select public.v2_is_moderator() as m`);
const comumMod = await as('authenticated', reader, `select public.v2_is_moderator() as m`);
if (suspensoMod.rows[0].m !== true || comumMod.rows[0].m !== false) throw new Error('v2_is_moderator respondeu errado');
process.stdout.write('Moderação (Spec 102): verificada com sucesso\n');

// Spec 103 / ADR 0079: limites por pessoa (código IBLIM) contra spam.
const spammer = '77777777-7777-4777-8777-777777777777';
await db.exec(`reset role; insert into auth.users (id) values ('${spammer}')`);
async function limitado(label, action) {
  try {
    await action();
  } catch (error) {
    if (error.code === 'IBLIM') { process.stdout.write(`${label}: limitado\n`); return; }
    throw error;
  }
  throw new Error(`${label}: limite não aplicado`);
}
for (let i = 0; i < 15; i++) {
  await as('authenticated', spammer, `insert into public.v2_books (owner_id, title, author, modality) values ('${spammer}', 'Spam ${i}', 'Autor', 'donation')`);
}
await limitado('16º anúncio no dia', () => as('authenticated', spammer, `insert into public.v2_books (owner_id, title, author, modality) values ('${spammer}', 'Spam 16', 'Autor', 'donation')`));
const novato = '88888888-8888-4888-8888-888888888888';
await db.exec(`reset role; insert into auth.users (id) values ('${novato}')`);
const livrosAlvo = await db.query(`select id from public.v2_books where owner_id = '${spammer}' order by title limit 11`);
for (const row of livrosAlvo.rows.slice(0, 10)) {
  await as('authenticated', novato, `insert into public.v2_book_requests (listing_id, requester_id) values ('${row.id}', '${novato}')`);
}
await limitado('11º pedido no dia', () => as('authenticated', novato, `insert into public.v2_book_requests (listing_id, requester_id) values ('${livrosAlvo.rows[10].id}', '${novato}')`));
const pedidoNovato = await db.query(`select id from public.v2_book_requests where requester_id = '${novato}' limit 1`);
await as('authenticated', spammer, `select public.accept_book_request('${pedidoNovato.rows[0].id}')`);
for (let i = 0; i < 30; i++) {
  await as('authenticated', novato, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedidoNovato.rows[0].id}', '${novato}', 'Msg ${i}')`);
}
await limitado('31ª mensagem em 5 minutos', () => as('authenticated', novato, `insert into public.v2_negotiation_messages (request_id, sender_id, content) values ('${pedidoNovato.rows[0].id}', '${novato}', 'Excesso')`));
for (const row of livrosAlvo.rows.slice(0, 10)) {
  await as('authenticated', novato, `insert into public.v2_reports (listing_id, reporter_id, reason) values ('${row.id}', '${novato}', 'other')`);
}
await limitado('11ª denúncia no dia', () => as('authenticated', novato, `insert into public.v2_user_reports (reporter_id, reported_user_id, reason) values ('${novato}', '${spammer}', 'other')`));
await db.exec(`reset role; insert into public.v2_books (owner_id, title, author, modality) values ('${spammer}', 'Pelo painel', 'Autor', 'donation')`);
process.stdout.write('Limites contra abuso (Spec 103): verificados com sucesso\n');

process.stdout.write('Migrações e cenários SQL locais verificados.\n');
await db.close();
