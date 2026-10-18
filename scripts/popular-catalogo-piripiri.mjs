/**
 * Script de Semente do Catálogo da Beta — Piripiri, PI
 * Gera e cadastra anúncios realistas de livros distribuídos pelos bairros de Piripiri.
 * 
 * Uso:
 *   node scripts/popular-catalogo-piripiri.mjs          # Executa validação e gera comandos SQL
 *   node scripts/popular-catalogo-piripiri.mjs --sql    # Emite apenas instruções SQL prontas para o Supabase
 */

import { PGlite } from '@electric-sql/pglite';

export const LIVROS_SEMENTE_PIRIPIRI = [
  {
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'Literatura Brasileira',
    modality: 'donation',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Centro',
    photo_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Vidas Secas',
    author: 'Graciliano Ramos',
    category: 'Literatura Brasileira',
    modality: 'sale',
    price: 25.00,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Paciência',
    photo_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Capitães da Areia',
    author: 'Jorge Amado',
    category: 'Ficção',
    modality: 'trade',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Petecas',
    photo_url: null,
  },
  {
    title: 'A Hora da Estrela',
    author: 'Clarice Lispector',
    category: 'Literatura Brasileira',
    modality: 'donation',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Crioli',
    photo_url: null,
  },
  {
    title: 'Torto Arado',
    author: 'Itamar Vieira Junior',
    category: 'Romance Contemporâneo',
    modality: 'sale',
    price: 35.00,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Vista Alegre',
    photo_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    category: 'Infantojuvenil',
    modality: 'donation',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Recreio',
    photo_url: null,
  },
  {
    title: 'Engenharia de Software',
    author: 'Ian Sommerville',
    category: 'Tecnologia e Computação',
    modality: 'trade',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Fonte dos Matos',
    photo_url: null,
  },
  {
    title: 'Cálculo Volume 1',
    author: 'James Stewart',
    category: 'Ciências Exatas',
    modality: 'sale',
    price: 60.00,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Centro',
    photo_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Algoritmos: Teoria e Prática',
    author: 'Thomas H. Cormen',
    category: 'Tecnologia e Computação',
    modality: 'trade',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'São João',
    photo_url: null,
  },
  {
    title: 'Memórias Póstumas de Brás Cubas',
    author: 'Machado de Assis',
    category: 'Literatura Brasileira',
    modality: 'donation',
    price: null,
    city: 'Piripiri',
    state: 'PI',
    neighborhood: 'Germano',
    photo_url: null,
  },
];

export function gerarSqlSeed(ownerUuid = '11111111-1111-4111-8111-111111111111') {
  const valores = LIVROS_SEMENTE_PIRIPIRI.map((l) => {
    const photoSql = l.photo_url ? `'${l.photo_url}'` : 'null';
    const priceSql = l.price !== null ? l.price.toFixed(2) : 'null';
    const catSql = l.category ? `'${l.category}'` : 'null';
    return `  ('${ownerUuid}', '${l.title.replace(/'/g, "''")}', '${l.author.replace(/'/g, "''")}', ${catSql}, '${l.modality}', ${priceSql}, 'available', '${l.city}', '${l.state}', '${l.neighborhood}', ${photoSql})`;
  }).join(',\n');

  return `-- Inserção de dados semente para a Beta de Piripiri, PI
insert into public.v2_books (
  owner_id, title, author, category, modality, price, status, city, state, neighborhood, photo_url
) values
${valores}
on conflict do nothing;`;
}

async function executarValidacaoLocal() {
  const db = new PGlite();
  await db.exec(`
    create schema if not exists auth;
    create table if not exists auth.users (id uuid primary key);
    insert into auth.users (id) values ('11111111-1111-4111-8111-111111111111') on conflict do nothing;
    create table if not exists public.v2_books (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references auth.users(id),
      title text not null,
      author text not null,
      category text,
      modality text not null check (modality in ('sale', 'trade', 'donation')),
      price numeric,
      status text not null default 'available' check (status in ('available', 'reserved', 'paused')),
      city text default 'Piripiri',
      state text default 'PI',
      neighborhood text,
      photo_url text,
      photos text[] default array[]::text[],
      created_at timestamptz not null default now()
    );
  `);

  const sql = gerarSqlSeed();
  await db.exec(sql);

  const res = await db.query('select count(*) as total, count(distinct neighborhood) as bairros from public.v2_books;');
  const row = res.rows[0];
  process.stdout.write(`Validação local do seed concluída: ${row.total} livros inseridos em ${row.bairros} bairros de Piripiri, PI.\n`);
  await db.close();
}

import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  const args = process.argv.slice(2);
  if (args.includes('--sql')) {
    process.stdout.write(gerarSqlSeed() + '\n');
  } else {
    await executarValidacaoLocal();
    process.stdout.write('\nPara exportar o SQL bruto execute:\n  npm run db:seed -- --sql\n');
  }
}

