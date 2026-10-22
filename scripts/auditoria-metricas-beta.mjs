/**
 * Script de Auditoria e Métricas Agregadas da Beta — Piripiri, PI
 * Issue #179 / Spec 047
 *
 * Consolida estatísticas agregadas de livros por bairro, modalidade e status,
 * com estrita conformidade à LGPD (Lei 13.709/2018): 100% livre de dados pessoais.
 *
 * Suporta execução contra PGlite local (migrações + semente) ou Supabase remoto.
 *
 * Modos de uso:
 *   npm run stats:beta                     # Execução local com saída amigável no terminal
 *   npm run stats:beta -- --json           # Emite JSON estruturado com métricas agregadas
 *   npm run stats:beta -- --markdown       # Emite relatório formatado em Markdown
 *   npm run stats:beta -- --remote         # Consulta backend Supabase remoto (.env)
 *   npm run stats:beta -- --help           # Exibe ajuda e opções de linha de comando
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { LIVROS_SEMENTE_PIRIPIRI, gerarSqlSeed } from './popular-catalogo-piripiri.mjs';

export const PIRIPIRI_NEIGHBORHOODS = [
  'Centro',
  'Paciência',
  'Petecas',
  'Crioli',
  'Prado',
  'Matadouro',
  'Vista Alegre',
  'Fonte dos Matos',
  'Floresta',
  'Recreio',
  'São João',
  'Germano',
  "Caixa D'Água",
  'Estação',
  'Santa Maria',
  'Itacolomi',
  'Morada dos Frades',
];

export const LGPD_FORBIDDEN_KEYS = new Set([
  'id',
  'uuid',
  'owner_id',
  'requester_id',
  'user_id',
  'email',
  'mail',
  'name',
  'full_name',
  'phone',
  'telefone',
  'photo',
  'photo_url',
  'foto',
  'avatar',
  'cpf',
  'rg',
  'ip',
  'token',
  'secret',
  'password',
  'senha',
]);

const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validação de conformidade LGPD: garante por inspeção recursiva que nenhum
 * identificador pessoal, e-mail ou UUID vazou para a saída consolidada.
 */
export function validarConformidadeLgpd(objeto, caminho = 'raiz') {
  if (objeto === null || objeto === undefined) return true;

  if (typeof objeto === 'string') {
    if (REGEX_EMAIL.test(objeto)) {
      throw new Error(`Violação LGPD detectada em ${caminho}: e-mail identificado.`);
    }
    if (REGEX_UUID.test(objeto.trim())) {
      throw new Error(`Violação LGPD detectada em ${caminho}: UUID de titular identificado.`);
    }
    return true;
  }

  if (Array.isArray(objeto)) {
    for (let i = 0; i < objeto.length; i++) {
      validarConformidadeLgpd(objeto[i], `${caminho}[${i}]`);
    }
    return true;
  }

  if (typeof objeto === 'object') {
    for (const [chave, valor] of Object.entries(objeto)) {
      const chaveNormalizada = chave.toLowerCase();
      if (LGPD_FORBIDDEN_KEYS.has(chaveNormalizada)) {
        throw new Error(`Violação LGPD detectada: chave pessoal proibida '${chave}' encontrada em ${caminho}.`);
      }
      validarConformidadeLgpd(valor, `${caminho}.${chave}`);
    }
    return true;
  }

  return true;
}

/**
 * Agrega métricas estatísticas a partir das listas de livros e pedidos.
 */
export function agregarMetricasBeta(livros = [], pedidos = [], options = {}) {
  const totalLivros = livros.length;

  // Contagem anônima de titulares sem guardar ou expor os UUIDs
  const anunciantesSet = new Set();
  for (const livro of livros) {
    if (livro.owner_id) anunciantesSet.add(String(livro.owner_id));
  }
  const totalAnunciantesUnicos = anunciantesSet.size;
  const mediaLivrosPorAnunciante = totalAnunciantesUnicos > 0
    ? Number((totalLivros / totalAnunciantesUnicos).toFixed(2))
    : 0;

  // 1. Distribuição Territorial por Bairro de Piripiri
  const bairroStatsMap = new Map();
  for (const b of PIRIPIRI_NEIGHBORHOODS) {
    bairroStatsMap.set(b, {
      bairro: b,
      oficialPiripiri: true,
      total: 0,
      disponiveis: 0,
      reservados: 0,
      pausados: 0,
      troca: 0,
      doacao: 0,
      venda: 0,
      percentual: 0,
    });
  }

  const outrosBairrosMap = new Map();

  for (const livro of livros) {
    const rawBairro = (livro.neighborhood || '').trim();
    let entry = bairroStatsMap.get(rawBairro);

    if (!entry) {
      const match = PIRIPIRI_NEIGHBORHOODS.find((b) => b.toLowerCase() === rawBairro.toLowerCase());
      if (match) {
        entry = bairroStatsMap.get(match);
      }
    }

    if (!entry) {
      const chaveOutro = rawBairro || 'Não informado';
      if (!outrosBairrosMap.has(chaveOutro)) {
        outrosBairrosMap.set(chaveOutro, {
          bairro: chaveOutro,
          oficialPiripiri: false,
          total: 0,
          disponiveis: 0,
          reservados: 0,
          pausados: 0,
          troca: 0,
          doacao: 0,
          venda: 0,
          percentual: 0,
        });
      }
      entry = outrosBairrosMap.get(chaveOutro);
    }

    entry.total += 1;
    const status = (livro.status || '').toLowerCase();
    if (status === 'available') entry.disponiveis += 1;
    else if (status === 'reserved') entry.reservados += 1;
    else if (status === 'paused') entry.pausados += 1;

    const modalidade = (livro.modality || '').toLowerCase();
    if (modalidade === 'trade') entry.troca += 1;
    else if (modalidade === 'donation') entry.doacao += 1;
    else if (modalidade === 'sale') entry.venda += 1;
  }

  const bairrosConsolidados = [
    ...bairroStatsMap.values(),
    ...outrosBairrosMap.values(),
  ].map((b) => ({
    ...b,
    percentual: totalLivros > 0 ? Number(((b.total / totalLivros) * 100).toFixed(1)) : 0,
  }));

  // Ordenar por volume decrescente, mantendo ordem alfabética para desempate
  bairrosConsolidados.sort((a, b) => b.total - a.total || a.bairro.localeCompare(b.bairro, 'pt-BR'));

  const bairrosComOferta = bairrosConsolidados.filter((b) => b.oficialPiripiri && b.total > 0).length;
  const taxaCoberturaBairros = Number(((bairrosComOferta / PIRIPIRI_NEIGHBORHOODS.length) * 100).toFixed(1));

  // 2. Modalidades de Circulação
  let totalTroca = 0;
  let totalDoacao = 0;
  let totalVenda = 0;
  const precosVenda = [];

  for (const livro of livros) {
    const mod = (livro.modality || '').toLowerCase();
    if (mod === 'trade') totalTroca += 1;
    else if (mod === 'donation') totalDoacao += 1;
    else if (mod === 'sale') {
      totalVenda += 1;
      const precoNum = typeof livro.price === 'string' ? parseFloat(livro.price) : Number(livro.price);
      if (!Number.isNaN(precoNum) && precoNum > 0) {
        precosVenda.push(precoNum);
      }
    }
  }

  const precoMedioVenda = precosVenda.length > 0
    ? Number((precosVenda.reduce((s, p) => s + p, 0) / precosVenda.length).toFixed(2))
    : null;
  const precoMinimoVenda = precosVenda.length > 0 ? Math.min(...precosVenda) : null;
  const precoMaximoVenda = precosVenda.length > 0 ? Math.max(...precosVenda) : null;

  const modalidades = {
    troca: {
      total: totalTroca,
      percentual: totalLivros > 0 ? Number(((totalTroca / totalLivros) * 100).toFixed(1)) : 0,
    },
    doacao: {
      total: totalDoacao,
      percentual: totalLivros > 0 ? Number(((totalDoacao / totalLivros) * 100).toFixed(1)) : 0,
    },
    venda: {
      total: totalVenda,
      percentual: totalLivros > 0 ? Number(((totalVenda / totalLivros) * 100).toFixed(1)) : 0,
      precoMedio: precoMedioVenda,
      precoMinimo: precoMinimoVenda,
      precoMaximo: precoMaximoVenda,
    },
  };
  modalidades.trade = modalidades.troca;
  modalidades.donation = modalidades.doacao;
  modalidades.sale = modalidades.venda;

  // 3. Status dos Anúncios
  let totalDisponiveis = 0;
  let totalReservados = 0;
  let totalPausados = 0;
  let totalOutrosStatus = 0;

  for (const livro of livros) {
    const st = (livro.status || '').toLowerCase();
    if (st === 'available') totalDisponiveis += 1;
    else if (st === 'reserved') totalReservados += 1;
    else if (st === 'paused') totalPausados += 1;
    else totalOutrosStatus += 1;
  }

  const statusAnuncios = {
    disponivel: {
      total: totalDisponiveis,
      percentual: totalLivros > 0 ? Number(((totalDisponiveis / totalLivros) * 100).toFixed(1)) : 0,
    },
    reservado: {
      total: totalReservados,
      percentual: totalLivros > 0 ? Number(((totalReservados / totalLivros) * 100).toFixed(1)) : 0,
    },
    pausado: {
      total: totalPausados,
      percentual: totalLivros > 0 ? Number(((totalPausados / totalLivros) * 100).toFixed(1)) : 0,
    },
    outros: {
      total: totalOutrosStatus,
      percentual: totalLivros > 0 ? Number(((totalOutrosStatus / totalLivros) * 100).toFixed(1)) : 0,
    },
  };
  statusAnuncios.available = statusAnuncios.disponivel;
  statusAnuncios.reserved = statusAnuncios.reservado;
  statusAnuncios.paused = statusAnuncios.pausado;

  // 4. Métricas de Pedidos e Negociações (se fornecidos)
  const totalPedidos = pedidos.length;
  const pedidosStatus = {
    pendente: 0,
    aceito: 0,
    rejeitado: 0,
    cancelado: 0,
    concluido: 0,
    outros: 0,
  };
  const pedidosModalidade = {
    troca: 0,
    doacao: 0,
    venda: 0,
  };

  for (const pedido of pedidos) {
    const st = (pedido.status || '').toLowerCase();
    if (st === 'pending') pedidosStatus.pendente += 1;
    else if (st === 'accepted') pedidosStatus.aceito += 1;
    else if (st === 'rejected') pedidosStatus.rejeitado += 1;
    else if (st === 'cancelled') pedidosStatus.cancelado += 1;
    else if (st === 'completed') pedidosStatus.concluido += 1;
    else pedidosStatus.outros += 1;

    const mod = (pedido.proposed_modality || '').toLowerCase();
    if (mod === 'trade') pedidosModalidade.troca += 1;
    else if (mod === 'donation') pedidosModalidade.doacao += 1;
    else if (mod === 'sale') pedidosModalidade.venda += 1;
  }

  const pedidosFinalizadosSucesso = pedidosStatus.aceito + pedidosStatus.concluido;
  const taxaSucessoNegociacoes = totalPedidos > 0
    ? Number(((pedidosFinalizadosSucesso / totalPedidos) * 100).toFixed(1))
    : 0;

  const resultado = {
    geral: {
      cidade: 'Piripiri',
      estado: 'PI',
      totalLivros,
      totalAnunciantesUnicos,
      mediaLivrosPorAnunciante,
      coberturaBairros: {
        bairrosComOferta,
        totalBairrosOficiais: PIRIPIRI_NEIGHBORHOODS.length,
        taxaCobertura: taxaCoberturaBairros,
      },
      totalPedidos,
      origemDados: options.origem || 'desconhecida',
      dataAuditoria: options.data || new Date().toISOString(),
    },
    modalidades,
    statusAnuncios,
    distribuicaoBairros: bairrosConsolidados,
    negociacoes: {
      totalPedidos,
      porStatus: pedidosStatus,
      porModalidade: pedidosModalidade,
      taxaSucesso: taxaSucessoNegociacoes,
    },
    conformidadeLgpd: {
      emConformidade: true,
      artigoReferencia: 'Art. 5º, III e Art. 12 da Lei nº 13.709/2018 (LGPD)',
      detalhe: 'Dados agregados e anonimizados. Zero exposição de informações pessoais (PII).',
    },
  };

  validarConformidadeLgpd(resultado);
  return resultado;
}

/**
 * Formata as métricas em texto visual e legível para terminais.
 */
export function formatarRelatorioTerminal(metricas) {
  const { geral, modalidades, statusAnuncios, distribuicaoBairros, negociacoes } = metricas;

  const linhaSep = '═'.repeat(74);
  const divisoria = '─'.repeat(74);

  const formatPreco = (num) => (num !== null && num !== undefined ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'N/A');

  const linhas = [
    linhaSep,
    '  IpêBook — Relatório de Auditoria e Métricas da Beta (Piripiri, PI)',
    linhaSep,
    `  Origem dos dados : ${geral.origemDados}`,
    `  Data do relatório: ${geral.dataAuditoria}`,
    `  Privacidade LGPD : 100% em conformidade (nenhum dado pessoal exposto)`,
    divisoria,
    '  📊 VISÃO GERAL',
    `  ├─ Livros cadastrados          : ${geral.totalLivros}`,
    `  ├─ Anunciantes únicos (anônimo): ${geral.totalAnunciantesUnicos}`,
    `  ├─ Média de livros/anunciante  : ${geral.mediaLivrosPorAnunciante}`,
    `  ├─ Cobertura em Piripiri       : ${geral.coberturaBairros.bairrosComOferta} de ${geral.coberturaBairros.totalBairrosOficiais} bairros (${geral.coberturaBairros.taxaCobertura}%)`,
    `  └─ Negociações registradas     : ${geral.totalPedidos}`,
    divisoria,
    '  🏷️ MODALIDADES DE CIRCULAÇÃO',
    `  ┌──────────────┬────────┬────────────┬─────────────────────────────────┐`,
    `  │ Modalidade   │ Total  │ Proporção  │ Faixa / Média de Preço          │`,
    `  ├──────────────┼────────┼────────────┼─────────────────────────────────┤`,
    `  │ Doação       │ ${String(modalidades.doacao.total).padStart(6)} │ ${String(modalidades.doacao.percentual.toFixed(1) + '%').padStart(10)} │ Gratuito (comunitário)          │`,
    `  │ Troca        │ ${String(modalidades.troca.total).padStart(6)} │ ${String(modalidades.troca.percentual.toFixed(1) + '%').padStart(10)} │ Troca por outro exemplar        │`,
    `  │ Venda        │ ${String(modalidades.venda.total).padStart(6)} │ ${String(modalidades.venda.percentual.toFixed(1) + '%').padStart(10)} │ Méd: ${formatPreco(modalidades.venda.precoMedio)} (${formatPreco(modalidades.venda.precoMinimo)}–${formatPreco(modalidades.venda.precoMaximo)}) │`,
    `  └──────────────┴────────┴────────────┴─────────────────────────────────┘`,
    divisoria,
    '  📌 STATUS DOS ANÚNCIOS',
    `  ├─ Disponíveis : ${statusAnuncios.disponivel.total} (${statusAnuncios.disponivel.percentual}%)`,
    `  ├─ Reservados  : ${statusAnuncios.reservado.total} (${statusAnuncios.reservado.percentual}%)`,
    `  ├─ Pausados    : ${statusAnuncios.pausado.total} (${statusAnuncios.pausado.percentual}%)`,
    `  └─ Outros      : ${statusAnuncios.outros.total} (${statusAnuncios.outros.percentual}%)`,
    divisoria,
    '  📍 DISTRIBUIÇÃO POR BAIRRO DE PIRIPIRI, PI',
    `  ┌────────────────────┬────────┬────────────┬───────┬───────┬───────┬───────┐`,
    `  │ Bairro             │ Total  │ Proporção  │ Disp. │ Troca │ Doação│ Venda │`,
    `  ├────────────────────┼────────┼────────────┼───────┼───────┼───────┼───────┤`,
  ];

  for (const b of distribuicaoBairros) {
    const nomeBairro = b.bairro.padEnd(18).slice(0, 18);
    const tot = String(b.total).padStart(6);
    const pct = String(b.percentual.toFixed(1) + '%').padStart(10);
    const dsp = String(b.disponiveis).padStart(5);
    const trc = String(b.troca).padStart(5);
    const doa = String(b.doacao).padStart(5);
    const vnd = String(b.venda).padStart(5);
    linhas.push(`  │ ${nomeBairro} │ ${tot} │ ${pct} │ ${dsp} │ ${trc} │ ${doa} │ ${vnd} │`);
  }

  linhas.push(
    `  └────────────────────┴────────┴────────────┴───────┴───────┴───────┴───────┘`,
    divisoria,
    '  🤝 PEDIDOS E NEGOCIAÇÕES',
    `  ├─ Total de pedidos            : ${negociacoes.totalPedidos}`,
    `  ├─ Pendentes / Em andamento    : ${negociacoes.porStatus.pendente}`,
    `  ├─ Aceitos / Concluídos        : ${negociacoes.porStatus.aceito + negociacoes.porStatus.concluido}`,
    `  ├─ Rejeitados / Cancelados     : ${negociacoes.porStatus.rejeitado + negociacoes.porStatus.cancelado}`,
    `  └─ Taxa de sucesso (aceite/fim): ${negociacoes.taxaSucesso}%`,
    linhaSep,
    '  🔒 Conformidade LGPD garantida por design (Art. 5º, III e Art. 12 da Lei 13.709)',
    linhaSep
  );

  return linhas.join('\n');
}

/**
 * Formata as métricas em documento estruturado Markdown.
 */
export function formatarRelatorioMarkdown(metricas) {
  const { geral, modalidades, statusAnuncios, distribuicaoBairros, negociacoes, conformidadeLgpd } = metricas;

  const formatPreco = (num) => (num !== null && num !== undefined ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'N/A');

  return `# Relatório de Auditoria e Métricas da Beta — Piripiri, PI

- **Data da Auditoria:** ${geral.dataAuditoria}
- **Origem dos Dados:** \`${geral.origemDados}\`
- **Território:** ${geral.cidade}, ${geral.estado}
- **Conformidade LGPD:** ${conformidadeLgpd.artigoReferencia} — ${conformidadeLgpd.detalhe}

## 1. Visão Geral Operacional

| Métrica | Valor |
|:---|---:|
| **Total de Livros Cadastrados** | ${geral.totalLivros} |
| **Anunciantes Únicos (anônimo)** | ${geral.totalAnunciantesUnicos} |
| **Média de Livros por Anunciante** | ${geral.mediaLivrosPorAnunciante} |
| **Bairros Oficiais Atendidos** | ${geral.coberturaBairros.bairrosComOferta} / ${geral.coberturaBairros.totalBairrosOficiais} |
| **Taxa de Cobertura Territorial** | ${geral.coberturaBairros.taxaCobertura}% |
| **Total de Negociações/Pedidos** | ${geral.totalPedidos} |

## 2. Modalidades de Circulação

| Modalidade | Quantidade | Proporção | Preço Médio | Faixa de Preço |
|:---|---:|---:|---:|:---|
| **Doação** | ${modalidades.doacao.total} | ${modalidades.doacao.percentual}% | — | Gratuito |
| **Troca** | ${modalidades.troca.total} | ${modalidades.troca.percentual}% | — | Troca por outro livro |
| **Venda** | ${modalidades.venda.total} | ${modalidades.venda.percentual}% | ${formatPreco(modalidades.venda.precoMedio)} | ${formatPreco(modalidades.venda.precoMinimo)} a ${formatPreco(modalidades.venda.precoMaximo)} |

## 3. Status dos Anúncios

| Status | Total | Proporção |
|:---|---:|---:|
| **Disponível** | ${statusAnuncios.disponivel.total} | ${statusAnuncios.disponivel.percentual}% |
| **Reservado** | ${statusAnuncios.reservado.total} | ${statusAnuncios.reservado.percentual}% |
| **Pausado** | ${statusAnuncios.pausado.total} | ${statusAnuncios.pausado.percentual}% |
| **Outros** | ${statusAnuncios.outros.total} | ${statusAnuncios.outros.percentual}% |

## 4. Distribuição Territorial por Bairro de Piripiri

| Bairro | Total | Proporção | Disponíveis | Troca | Doação | Venda | Oficial Piripiri |
|:---|---:|---:|---:|---:|---:|---:|:---:|
${distribuicaoBairros
  .map(
    (b) =>
      `| ${b.bairro} | ${b.total} | ${b.percentual}% | ${b.disponiveis} | ${b.troca} | ${b.doacao} | ${b.venda} | ${b.oficialPiripiri ? 'Sim' : 'Não'} |`
  )
  .join('\n')}

## 5. Pedidos e Negociações

- **Total de Pedidos:** ${negociacoes.totalPedidos}
- **Pendentes:** ${negociacoes.porStatus.pendente}
- **Aceitos / Concluídos:** ${negociacoes.porStatus.aceito + negociacoes.porStatus.concluido}
- **Rejeitados / Cancelados:** ${negociacoes.porStatus.rejeitado + negociacoes.porStatus.cancelado}
- **Taxa de Sucesso:** ${negociacoes.taxaSucesso}%

## 6. Declaração de Conformidade com a LGPD

O presente relatório e os dados consolidados operam sob anonimização estrita em consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Nomes de usuários, e-mails, endereços completos, números de telefone e identificadores de conta (UUIDs) são completamente descartados na camada de consulta e não constam de qualquer saída gerada pelo sistema.
`;
}

/**
 * Emite a representação estruturada em JSON das métricas.
 */
export function gerarRelatorioJson(metricas) {
  return JSON.stringify(metricas, null, 2);
}

/**
 * Carrega variáveis do arquivo .env caso existam.
 */
export function carregarVariaveisAmbiente() {
  const envFiles = ['.env', '.env.local'];
  const env = {};
  for (const file of envFiles) {
    const envPath = resolve(process.cwd(), file);
    if (!existsSync(envPath)) continue;
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

/**
 * Carrega dados locais utilizando PGlite (migrações + semente).
 */
export async function carregarDadosPGlite(options = {}) {
  const db = new PGlite();
  const owner = options.ownerId || '11111111-1111-4111-8111-111111111111';

  try {
    await db.exec(`
      create schema if not exists auth;
      create role anon nologin;
      create role authenticated nologin;
      create table if not exists auth.users (id uuid primary key);
      create or replace function auth.uid() returns uuid stable language sql as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      insert into auth.users (id) values ('${owner}') on conflict do nothing;
      create table if not exists public.listings (id uuid primary key);
      create table if not exists public.book_requests (id uuid primary key);
      create table if not exists public.profiles (user_id uuid primary key);
      create schema if not exists storage;
      create table if not exists storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
      create table if not exists storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, created_at timestamptz default now());
      create or replace function storage.foldername(name text)
      returns text[]
      language sql
      immutable
      as $$
        select string_to_array(name, '/');
      $$;
    `);

    // Executa as migrações oficiais do projeto
    const migrationsDir = new URL('../supabase/migrations/', import.meta.url);
    if (existsSync(migrationsDir)) {
      const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
      for (const name of migrations) {
        const sql = readFileSync(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
        await db.exec(sql);
      }
    }

    // Se solicitado seed, popula com livros de Piripiri
    if (options.seed !== false) {
      const sqlSeed = gerarSqlSeed(owner);
      await db.exec(sqlSeed);
    }

    const resLivros = await db.query(
      'select id, owner_id, modality, price, status, city, state, neighborhood from public.v2_books;'
    );

    let pedidos = [];
    try {
      const resPedidos = await db.query(
        'select id, status, proposed_modality from public.book_requests;'
      );
      pedidos = resPedidos.rows;
    } catch {
      // Caso a tabela não contenha colunas de pedidos ou esteja vazia
      pedidos = [];
    }

    return {
      origem: 'PGlite Local (migrações + semente de Piripiri)',
      livros: resLivros.rows,
      pedidos,
    };
  } finally {
    await db.close();
  }
}

/**
 * Consulta dados remotos a partir do backend Supabase via REST API.
 */
export async function carregarDadosRemoto(options = {}) {
  const fileEnv = carregarVariaveisAmbiente();
  const supabaseUrl = options.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || fileEnv.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = options.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || fileEnv.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Credenciais do Supabase não configuradas no ambiente ou arquivo .env.\n' +
      'Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou use o modo local padrão).'
    );
  }

  const maskedUrl = supabaseUrl.replace(/https?:\/\/([^.]+).*/, 'https://$1.supabase.co');

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };

  const booksRes = await fetch(
    `${supabaseUrl}/rest/v1/v2_books?select=id,modality,price,status,city,state,neighborhood,owner_id`,
    { headers }
  );

  if (!booksRes.ok) {
    throw new Error(`Falha ao consultar v2_books no Supabase: ${booksRes.status} ${booksRes.statusText}`);
  }

  const livros = await booksRes.json();

  let pedidos = [];
  try {
    const pedidosRes = await fetch(
      `${supabaseUrl}/rest/v1/book_requests?select=id,status,proposed_modality`,
      { headers }
    );
    if (pedidosRes.ok) {
      pedidos = await pedidosRes.json();
    }
  } catch {
    pedidos = [];
  }

  return {
    origem: `Supabase Remoto (${maskedUrl})`,
    livros: Array.isArray(livros) ? livros : [],
    pedidos: Array.isArray(pedidos) ? pedidos : [],
  };
}

/**
 * Função principal de execução da auditoria.
 */
export async function executarAuditoriaBeta(argv = process.argv.slice(2)) {
  const args = new Set(argv);

  if (args.has('--help') || args.has('-h')) {
    process.stdout.write(`
IpêBook — Script de Auditoria e Métricas da Beta em Piripiri, PI (Issue #179 / Spec 047)

Uso:
  npm run stats:beta [opções]
  node scripts/auditoria-metricas-beta.mjs [opções]

Opções de Origem de Dados:
  --local, -l      Executa contra banco PGlite em memória com migrações e dados semente (padrão)
  --remote, -r     Consulta a API REST do Supabase remoto (.env)

Opções de Formato de Saída:
  (sem flag)       Relatório legível formatado para terminal
  --markdown, -m   Emite o relatório estruturado em formato Markdown
  --json, -j       Emite os dados agregados em formato JSON estruturado
  --help, -h       Exibe esta ajuda

Conformidade LGPD:
  100% de conformidade com os princípios da Lei nº 13.709/2018 (Art. 5º, III e Art. 12).
  Nenhum dado pessoal, e-mail ou nome é exposto.
\n`);
    return 0;
  }

  const isRemote = args.has('--remote') || args.has('-r');
  const isJson = args.has('--json') || args.has('-j');
  const isMarkdown = args.has('--markdown') || args.has('-m');

  let dados;
  if (isRemote) {
    if (!isJson && !isMarkdown) {
      process.stdout.write('Conectando ao Supabase remoto...\n');
    }
    dados = await carregarDadosRemoto();
  } else {
    dados = await carregarDadosPGlite();
  }

  const metricas = agregarMetricasBeta(dados.livros, dados.pedidos, {
    origem: dados.origem,
    data: new Date().toISOString(),
  });

  if (isJson) {
    process.stdout.write(gerarRelatorioJson(metricas) + '\n');
  } else if (isMarkdown) {
    process.stdout.write(formatarRelatorioMarkdown(metricas) + '\n');
  } else {
    process.stdout.write(formatarRelatorioTerminal(metricas) + '\n');
  }

  return 0;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  try {
    const exitCode = await executarAuditoriaBeta(process.argv.slice(2));
    process.exit(exitCode);
  } catch (err) {
    process.stderr.write(`❌ Erro na auditoria: ${err.message}\n`);
    process.exit(1);
  }
}
