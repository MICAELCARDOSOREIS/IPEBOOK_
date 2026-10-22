/**
 * Script de Diagnóstico de Saúde e Verificação de Migrações do Supabase Remoto
 * Issue #177 / Spec 049 / ADR 0033
 *
 * Inspeciona a conectividade, existência de tabelas, integridade de colunas,
 * disponibilidade do Supabase Storage e funções RPC no backend remoto do Supabase,
 * reconciliando os artefatos com as migrações versionadas em supabase/migrations/.
 *
 * Modos de uso:
 *   npm run health:supabase:remote               # Diagnóstico completo com saída visual
 *   npm run health:supabase:remote -- --json     # Emite JSON puro para automação / pipelines
 *   npm run health:supabase:remote -- --allow-pending # Exit 0 mesmo se houver migrações pendentes
 *   npm run health:supabase:remote -- --help     # Exibe opções e ajuda
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Sanitiza e mascara uma URL de backend para exibição segura,
 * ocultando tokens, credenciais ou portas não padronizadas.
 */
export function mascararUrl(url) {
  if (!url || typeof url !== 'string') return '(indefinida)';
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url.replace(/https?:\/\/([^/:]+).*/, 'https://$1');
  }
}

/**
 * Carrega a configuração de variáveis de ambiente a partir de um objeto customizado,
 * de process.env ou do arquivo .env no diretório base.
 * @param {Record<string, string | undefined> | null} [envCustom]
 * @param {string} [cwd]
 * @returns {{ ok: boolean, supabaseUrl: string, supabaseKey: string, maskedUrl: string, error?: string }}
 */
export function carregarConfiguracaoAmbiente(envCustom = null, cwd = process.cwd()) {
  let fileEnv = {};
  if (!envCustom) {
    const envPath = resolve(cwd, '.env');
    if (existsSync(envPath)) {
      try {
        const content = readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const [key, ...rest] = trimmed.split('=');
          if (key && rest.length > 0) {
            fileEnv[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      } catch (err) {
        return {
          ok: false,
          supabaseUrl: '',
          supabaseKey: '',
          maskedUrl: '',
          error: `Erro ao ler arquivo .env: ${err.message}`,
        };
      }
    }
  }

  const env = envCustom || { ...fileEnv, ...process.env };
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return {
      ok: false,
      supabaseUrl: '',
      supabaseKey: '',
      maskedUrl: '',
      error: 'Variáveis EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY não encontradas no ambiente ou no arquivo .env.',
    };
  }

  return {
    ok: true,
    supabaseUrl: supabaseUrl.replace(/\/+$/, ''),
    supabaseKey,
    maskedUrl: mascararUrl(supabaseUrl),
  };
}

/**
 * Testa conectividade básica e latência com o endpoint PostgREST do Supabase.
 */
export async function verificarConectividade(supabaseUrl, supabaseKey, fetchFn = fetch) {
  const start = Date.now();
  try {
    const res = await fetchFn(`${supabaseUrl}/rest/v1/v2_books?limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const latencyMs = Date.now() - start;
    if (res.ok) {
      return {
        ok: true,
        latencyMs,
        status: res.status,
        statusText: res.statusText,
      };
    }

    return {
      ok: false,
      latencyMs,
      status: res.status,
      statusText: res.statusText,
      error: `Supabase REST respondeu com status ${res.status}: ${res.statusText}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      status: 0,
      statusText: 'Network Error',
      error: `Falha na requisição de rede: ${err.message}`,
    };
  }
}

/**
 * Esquema de tabelas e colunas críticas esperadas pela aplicação v2.
 */
export const TABELAS_CRITICAS = {
  v2_books: {
    nome: 'v2_books',
    descricao: 'Catálogo de livros, fotos, conservação e localização',
    colunas: [
      'id',
      'owner_id',
      'title',
      'author',
      'modality',
      'price',
      'status',
      'created_at',
      'category',
      'city',
      'state',
      'neighborhood',
      'photo_url',
      'photos',
      'condition',
      'description',
    ],
  },
  v2_profiles: {
    nome: 'v2_profiles',
    descricao: 'Perfis de usuários, foto e redes sociais',
    colunas: ['id', 'name', 'created_at', 'photo_url', 'social_handle'],
  },
  v2_book_requests: {
    nome: 'v2_book_requests',
    descricao: 'Pedidos e negociações de livros',
    colunas: ['id', 'listing_id', 'requester_id', 'status', 'created_at'],
  },
  v2_favorites: {
    nome: 'v2_favorites',
    descricao: 'Livros favoritos marcados por leitores',
    colunas: ['id', 'user_id', 'book_id', 'created_at'],
  },
  v2_search_alerts: {
    nome: 'v2_search_alerts',
    descricao: 'Alertas de busca com filtro de modalidades',
    colunas: ['id', 'user_id', 'query', 'modalities', 'created_at'],
  },
  v2_reports: {
    nome: 'v2_reports',
    descricao: 'Denúncias e moderação de anúncios',
    colunas: ['id', 'listing_id', 'reporter_id', 'reason', 'details', 'created_at'],
  },
  v2_ratings: {
    nome: 'v2_ratings',
    descricao: 'Avaliações de confiança entre participantes',
    colunas: ['id', 'rater_id', 'rated_user_id', 'request_id', 'score', 'created_at'],
  },
  v2_notifications: {
    nome: 'v2_notifications',
    descricao: 'Notificações e avisos da plataforma',
    colunas: ['id', 'user_id', 'type', 'title', 'message', 'action_url', 'read', 'created_at'],
  },
  v2_user_preferences: {
    nome: 'v2_user_preferences',
    descricao: 'Preferências privadas de contato e bairro padrão',
    colunas: ['user_id', 'phone', 'neighborhood', 'updated_at'],
  },
  v2_meetings: {
    nome: 'v2_meetings',
    descricao: 'Encontros combinados nas negociações aceitas (Spec 052)',
    colunas: ['id', 'request_id', 'point_name', 'scheduled_at', 'proposed_by', 'status', 'created_at', 'updated_at'],
  },
};

/**
 * Inspeciona cada tabela e suas colunas críticas no PostgREST.
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<{ ok: boolean, tabelas: Record<string, { existe: boolean, ok: boolean, descricao: string, colunasValidas: string[], colunasAusentes: string[], erro?: string }> }>}
 */
export async function verificarTabelasEColunas(supabaseUrl, supabaseKey, fetchFn = fetch) {
  const resultados = {};
  let todasOk = true;

  for (const [chaveTabela, def] of Object.entries(TABELAS_CRITICAS)) {
    // 1. Tenta consultar com todas as colunas
    const selectParam = def.colunas.join(',');
    const url = `${supabaseUrl}/rest/v1/${def.nome}?select=${encodeURIComponent(selectParam)}&limit=1`;

    try {
      const res = await fetchFn(url, {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        resultados[chaveTabela] = {
          existe: true,
          ok: true,
          descricao: def.descricao,
          colunasValidas: [...def.colunas],
          colunasAusentes: [],
        };
        continue;
      }

      // Se falhou, verifica se a tabela inteira não existe (404) ou se alguma coluna não existe (400)
      if (res.status === 404) {
        todasOk = false;
        resultados[chaveTabela] = {
          existe: false,
          ok: false,
          descricao: def.descricao,
          colunasValidas: [],
          colunasAusentes: [...def.colunas],
          erro: `Tabela '${def.nome}' não encontrada no esquema remoto (HTTP 404).`,
        };
        continue;
      }

      // Se deu 400, testamos quais colunas existem individualmente
      todasOk = false;
      const colunasValidas = [];
      const colunasAusentes = [];

      for (const col of def.colunas) {
        try {
          const colRes = await fetchFn(`${supabaseUrl}/rest/v1/${def.nome}?select=${encodeURIComponent(col)}&limit=1`, {
            method: 'GET',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          });

          if (colRes.ok) {
            colunasValidas.push(col);
          } else {
            colunasAusentes.push(col);
          }
        } catch {
          colunasAusentes.push(col);
        }
      }

      resultados[chaveTabela] = {
        existe: true,
        ok: colunasAusentes.length === 0,
        descricao: def.descricao,
        colunasValidas,
        colunasAusentes,
        erro: colunasAusentes.length > 0 ? `Colunas pendentes de migração: ${colunasAusentes.join(', ')}` : undefined,
      };
    } catch (err) {
      todasOk = false;
      resultados[chaveTabela] = {
        existe: false,
        ok: false,
        descricao: def.descricao,
        colunasValidas: [],
        colunasAusentes: [...def.colunas],
        erro: `Falha ao inspecionar tabela '${def.nome}': ${err.message}`,
      };
    }
  }

  return {
    ok: todasOk,
    tabelas: resultados,
  };
}

/**
 * Inspeciona a integridade e acessibilidade pública do bucket book-photos no Supabase Storage.
 */
export async function verificarStorage(supabaseUrl, supabaseKey, fetchFn = fetch) {
  const bucketName = 'book-photos';
  try {
    // 1. Testa probe de URL pública (espera NoSuchKey se existir e for público, NoSuchBucket se não existir)
    const probeRes = await fetchFn(`${supabaseUrl}/storage/v1/object/public/${bucketName}/__ipebook_healthcheck_probe__.txt`);
    const probeText = await probeRes.text();

    if (probeText.includes('NoSuchBucket') || probeText.includes('Bucket not found')) {
      return {
        ok: false,
        bucket: bucketName,
        publico: false,
        listagemOk: false,
        erro: `Bucket '${bucketName}' não existe no Supabase Storage remoto.`,
      };
    }

    // 2. Testa capacidade de listagem de objetos via API REST do Storage
    const listRes = await fetchFn(`${supabaseUrl}/storage/v1/object/list/${bucketName}`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix: '', limit: 1 }),
    });

    const listagemOk = listRes.ok;

    return {
      ok: true,
      bucket: bucketName,
      publico: true,
      listagemOk,
    };
  } catch (err) {
    return {
      ok: false,
      bucket: bucketName,
      publico: false,
      listagemOk: false,
      erro: `Erro ao testar storage: ${err.message}`,
    };
  }
}

/**
 * Inspeciona as funções RPC transacionais expostas na API REST do Supabase.
 * @param {string} supabaseUrl
 * @param {string} supabaseKey
 * @param {typeof fetch} [fetchFn]
 * @returns {Promise<{ ok: boolean, funcoes: Record<string, { nome: string, descricao: string, existe: boolean, ok: boolean, erro?: string }> }>}
 */
export async function verificarFuncoesRpc(supabaseUrl, supabaseKey, fetchFn = fetch) {
  const rpcs = {
    delete_user_account: {
      nome: 'delete_user_account',
      descricao: 'Exclusão atômica de conta e dados pessoais (LGPD)',
      params: { target_user_id: '00000000-0000-0000-0000-000000000000' },
    },
    accept_book_request: {
      nome: 'accept_book_request',
      descricao: 'Aceite atômico de pedido com bloqueio de concorrência e reserva do livro',
      params: { target_request_id: '00000000-0000-0000-0000-000000000000' },
    },
  };

  const resultados = {};
  let todasOk = true;

  for (const [chave, def] of Object.entries(rpcs)) {
    try {
      const res = await fetchFn(`${supabaseUrl}/rest/v1/rpc/${def.nome}`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(def.params),
      });

      const bodyText = await res.text();

      // PostgREST retorna código PGRST202 quando a função não existe no schema cache
      if (res.status === 404 && bodyText.includes('PGRST202')) {
        todasOk = false;
        resultados[chave] = {
          nome: def.nome,
          descricao: def.descricao,
          existe: false,
          ok: false,
          erro: `Função RPC 'public.${def.nome}' não encontrada no esquema remoto.`,
        };
        continue;
      }

      // Se retornou qualquer outro código (mesmo 400 por erro de negócio/auth), a função existe no catálogo
      resultados[chave] = {
        nome: def.nome,
        descricao: def.descricao,
        existe: true,
        ok: true,
      };
    } catch (err) {
      todasOk = false;
      resultados[chave] = {
        nome: def.nome,
        descricao: def.descricao,
        existe: false,
        ok: false,
        erro: `Falha ao testar RPC '${def.nome}': ${err.message}`,
      };
    }
  }

  return {
    ok: todasOk,
    funcoes: resultados,
  };
}

/**
 * Mapeamento determinístico das migrações SQL locais para seus artefatos remotos esperados.
 */
export const MAPEAMENTO_MIGRACOES = {
  '202610150001_contas_e_anuncios.sql': {
    titulo: 'Contas e anúncios v2',
    validar: (ctx) => ctx.tabelas.v2_books?.existe && ctx.tabelas.v2_books?.colunasValidas.includes('title'),
    detalhe: 'Tabela public.v2_books',
  },
  '202610150002_pedidos.sql': {
    titulo: 'Pedidos e negociações',
    validar: (ctx) => ctx.tabelas.v2_book_requests?.existe,
    detalhe: 'Tabela public.v2_book_requests',
  },
  '202610150003_favoritos_alertas.sql': {
    titulo: 'Favoritos, alertas e notificações',
    validar: (ctx) =>
      ctx.tabelas.v2_favorites?.existe &&
      ctx.tabelas.v2_search_alerts?.existe &&
      ctx.tabelas.v2_notifications?.existe,
    detalhe: 'Tabelas v2_favorites, v2_search_alerts e v2_notifications',
  },
  '202610170001_denuncias.sql': {
    titulo: 'Denúncias e moderação',
    validar: (ctx) => ctx.tabelas.v2_reports?.existe,
    detalhe: 'Tabela public.v2_reports',
  },
  '202610170002_fotos_anuncios.sql': {
    titulo: 'Fotos e localização do anúncio',
    validar: (ctx) =>
      ctx.tabelas.v2_books?.colunasValidas.includes('photo_url') &&
      ctx.tabelas.v2_books?.colunasValidas.includes('neighborhood'),
    detalhe: 'Colunas photo_url e neighborhood em v2_books',
  },
  '202610170003_pausar_anuncio.sql': {
    titulo: 'Status pausado para anúncios',
    validar: (ctx) => ctx.tabelas.v2_books?.colunasValidas.includes('status'),
    detalhe: 'Coluna status em v2_books',
  },
  '202610180001_indices_busca_catalogo.sql': {
    titulo: 'Índices de busca e catálogo',
    validar: (ctx) => ctx.tabelas.v2_books?.existe,
    detalhe: 'Índices de busca em public.v2_books',
  },
  '202610200001_unicidade_denuncias.sql': {
    titulo: 'Unicidade de denúncias por anúncio',
    validar: (ctx) => ctx.tabelas.v2_reports?.existe,
    detalhe: 'Restrição de denúncias únicas em v2_reports',
  },
  '202610200002_rpc_exclusao_conta.sql': {
    titulo: 'Função RPC de exclusão de conta (LGPD)',
    validar: (ctx) => ctx.rpc.funcoes?.delete_user_account?.existe,
    detalhe: 'RPC public.delete_user_account',
  },
  '202610200003_storage_book_photos.sql': {
    titulo: 'Bucket book-photos no Storage',
    validar: (ctx) => ctx.storage?.ok && ctx.storage?.publico,
    detalhe: 'Bucket público book-photos no Storage',
  },
  '202610200004_extensao_pg_trgm_indices.sql': {
    titulo: 'Extensão pg_trgm e índices de busca',
    validar: (ctx) => ctx.tabelas.v2_books?.existe,
    detalhe: 'Índices de busca textual em v2_books',
  },
  '202610200005_conservacao_descricao_anuncio.sql': {
    titulo: 'Conservação e descrição em anúncios',
    validar: (ctx) =>
      ctx.tabelas.v2_books?.colunasValidas.includes('condition') &&
      ctx.tabelas.v2_books?.colunasValidas.includes('description'),
    detalhe: 'Colunas condition e description em v2_books',
  },
  '202610200006_perfil_publico_e_avaliacoes.sql': {
    titulo: 'Perfil público e avaliações',
    validar: (ctx) =>
      ctx.tabelas.v2_profiles?.existe &&
      ctx.tabelas.v2_ratings?.existe,
    detalhe: 'Tabelas public.v2_profiles e public.v2_ratings',
  },
  '202610200007_edicao_perfil_proprio.sql': {
    titulo: 'Edição de foto e identificador de perfil',
    validar: (ctx) =>
      ctx.tabelas.v2_profiles?.colunasValidas.includes('photo_url') &&
      ctx.tabelas.v2_profiles?.colunasValidas.includes('social_handle'),
    detalhe: 'Colunas photo_url e social_handle em v2_profiles',
  },
  '202610200008_avaliacoes_e_aceite_atomico.sql': {
    titulo: 'Aceite atômico de pedidos via RPC',
    validar: (ctx) => ctx.rpc.funcoes?.accept_book_request?.existe,
    detalhe: 'RPC public.accept_book_request',
  },
  '202610210001_preferencias_privadas_perfil.sql': {
    titulo: 'Preferências privadas do titular (LGPD)',
    validar: (ctx) => ctx.tabelas.v2_user_preferences?.existe,
    detalhe: 'Tabela public.v2_user_preferences',
  },
  '202610210002_modalidades_alerta_busca.sql': {
    titulo: 'Modalidades persistidas em alertas de busca',
    validar: (ctx) => ctx.tabelas.v2_search_alerts?.colunasValidas.includes('modalities'),
    detalhe: 'Coluna modalities em public.v2_search_alerts',
  },
  '202610220001_encontros.sql': {
    titulo: 'Encontros combinados na negociação',
    validar: (ctx) => ctx.tabelas.v2_meetings?.existe,
    detalhe: 'Tabela public.v2_meetings',
  },
};

/**
 * Reconcilia os arquivos de migração presentes no diretório local contra os diagnósticos remotos.
 * @param {string} migrationsDir
 * @param {any} diagnosticoRemoto
 * @returns {{ total: number, aplicadas: number, pendentes: number, migracoes: Array<{ arquivo: string, titulo: string, detalhe: string, status: 'APLICADA' | 'PENDENTE' }>, erro?: string }}
 */
export function reconciliarMigracoesLocais(migrationsDir, diagnosticoRemoto) {
  let arquivosLocais = [];
  try {
    if (existsSync(migrationsDir)) {
      arquivosLocais = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
    }
  } catch (err) {
    return {
      total: 0,
      aplicadas: 0,
      pendentes: 0,
      migracoes: [],
      erro: `Erro ao listar migrações locais: ${err.message}`,
    };
  }

  const migracoes = [];
  let aplicadasCount = 0;
  let pendentesCount = 0;

  for (const arquivo of arquivosLocais) {
    const mapeamento = MAPEAMENTO_MIGRACOES[arquivo];
    let aplicada = false;

    if (mapeamento && typeof mapeamento.validar === 'function') {
      try {
        aplicada = Boolean(mapeamento.validar(diagnosticoRemoto));
      } catch {
        aplicada = false;
      }
    } else {
      // Se não houver regra específica mapeada, assume aplicada se o banco base estiver íntegro
      aplicada = diagnosticoRemoto.conectividade?.ok && diagnosticoRemoto.tabelas?.ok;
    }

    if (aplicada) {
      aplicadasCount += 1;
    } else {
      pendentesCount += 1;
    }

    migracoes.push({
      arquivo,
      titulo: mapeamento?.titulo || arquivo,
      detalhe: mapeamento?.detalhe || 'Esquema SQL',
      status: aplicada ? 'APLICADA' : 'PENDENTE',
    });
  }

  return {
    total: arquivosLocais.length,
    aplicadas: aplicadasCount,
    pendentes: pendentesCount,
    migracoes,
  };
}

/**
 * Executa o diagnóstico completo contra o Supabase remoto e reconcilia as migrações.
 * @param {{ envCustom?: Record<string, string | undefined> | null, cwd?: string, migrationsDir?: string, fetchFn?: typeof fetch }} [opcoes]
 * @returns {Promise<{ ok: boolean, configOk: boolean, maskedUrl?: string, erroConfiguracao?: string, conectividade: any, tabelas: any, storage: any, rpc: any, reconciliacao: any, pendencias: string[] }>}
 */
export async function executarDiagnosticoRemoto(opcoes = {}) {
  const {
    envCustom = null,
    cwd = process.cwd(),
    migrationsDir = resolve(cwd, 'supabase', 'migrations'),
    fetchFn = fetch,
  } = opcoes;

  const config = carregarConfiguracaoAmbiente(envCustom, cwd);
  if (!config.ok) {
    return {
      ok: false,
      configOk: false,
      erroConfiguracao: config.error,
      conectividade: { ok: false, latencyMs: 0, status: 0, error: config.error },
      tabelas: { ok: false, tabelas: {} },
      storage: { ok: false, bucket: 'book-photos', publico: false, listagemOk: false },
      rpc: { ok: false, funcoes: {} },
      reconciliacao: { total: 0, aplicadas: 0, pendentes: 0, migracoes: [] },
      pendencias: [config.error],
    };
  }

  const conectividade = await verificarConectividade(config.supabaseUrl, config.supabaseKey, fetchFn);
  if (!conectividade.ok) {
    return {
      ok: false,
      configOk: true,
      maskedUrl: config.maskedUrl,
      conectividade,
      tabelas: { ok: false, tabelas: {} },
      storage: { ok: false, bucket: 'book-photos', publico: false, listagemOk: false },
      rpc: { ok: false, funcoes: {} },
      reconciliacao: { total: 0, aplicadas: 0, pendentes: 0, migracoes: [] },
      pendencias: [conectividade.error || 'Falha de conectividade com o Supabase remoto.'],
    };
  }

  const [tabelas, storage, rpc] = await Promise.all([
    verificarTabelasEColunas(config.supabaseUrl, config.supabaseKey, fetchFn),
    verificarStorage(config.supabaseUrl, config.supabaseKey, fetchFn),
    verificarFuncoesRpc(config.supabaseUrl, config.supabaseKey, fetchFn),
  ]);

  const reconciliacao = reconciliarMigracoesLocais(migrationsDir, {
    conectividade,
    tabelas: tabelas.tabelas,
    storage,
    rpc,
  });

  const pendencias = [];

  for (const [tabela, res] of Object.entries(tabelas.tabelas)) {
    if (!res.existe) {
      pendencias.push(`Tabela ausente: ${tabela}`);
    } else if (res.colunasAusentes && res.colunasAusentes.length > 0) {
      pendencias.push(`Colunas ausentes em ${tabela}: ${res.colunasAusentes.join(', ')}`);
    }
  }

  if (!storage.ok) {
    pendencias.push(storage.erro || 'Bucket book-photos indisponível ou não público');
  }

  for (const [nomeRpc, res] of Object.entries(rpc.funcoes)) {
    if (!res.existe) {
      pendencias.push(`Função RPC ausente: public.${nomeRpc}`);
    }
  }

  for (const mig of reconciliacao.migracoes) {
    if (mig.status === 'PENDENTE') {
      pendencias.push(`Migração pendente: ${mig.arquivo} (${mig.titulo})`);
    }
  }

  const ok = conectividade.ok && tabelas.ok && storage.ok && rpc.ok && reconciliacao.pendentes === 0;

  return {
    ok,
    configOk: true,
    maskedUrl: config.maskedUrl,
    conectividade,
    tabelas,
    storage,
    rpc,
    reconciliacao,
    pendencias,
  };
}

/**
 * Formata o diagnóstico completo em texto amigável para exibição em terminal.
 */
export function formatarRelatorioTerminal(resultado) {
  const linhas = [];
  linhas.push('═══════════════════════════════════════════════════════════════════════');
  linhas.push('  IpêBook — Diagnóstico de Saúde e Migrações do Supabase Remoto        ');
  linhas.push('  Piripiri, PI · Operação da Versão 2 (Issue #177 / Spec 049)          ');
  linhas.push('═══════════════════════════════════════════════════════════════════════\n');

  if (!resultado.configOk) {
    linhas.push(`❌ Configuração de Ambiente: FALHA`);
    linhas.push(`   ${resultado.erroConfiguracao || 'Credenciais ausentes.'}\n`);
    linhas.push('Ação recomendada: configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    linhas.push('em seu arquivo .env a partir do modelo .env.example.');
    return linhas.join('\n');
  }

  linhas.push(`1. Configuração e Conectividade:`);
  linhas.push(`   • Backend Remoto: ${resultado.maskedUrl}`);
  if (resultado.conectividade.ok) {
    linhas.push(`   • Status REST: OK (${resultado.conectividade.status} ${resultado.conectividade.statusText || 'OK'})`);
    linhas.push(`   • Latência de Rede: ${resultado.conectividade.latencyMs} ms\n`);
  } else {
    linhas.push(`   • Status REST: ❌ FALHA (${resultado.conectividade.error})\n`);
    return linhas.join('\n');
  }

  linhas.push(`2. Tabelas e Colunas do Esquema (PostgREST):`);
  for (const [nome, t] of Object.entries(resultado.tabelas.tabelas || {})) {
    if (!t.existe) {
      linhas.push(`   • ${nome.padEnd(22)} ❌ INEXISTENTE (${t.descricao})`);
    } else if (t.colunasAusentes && t.colunasAusentes.length > 0) {
      linhas.push(`   • ${nome.padEnd(22)} ⚠️  PARCIAL (${t.colunasValidas.length}/${t.colunasValidas.length + t.colunasAusentes.length} colunas)`);
      linhas.push(`     ↳ Ausentes: ${t.colunasAusentes.join(', ')}`);
    } else {
      linhas.push(`   • ${nome.padEnd(22)} ✔  OK (${t.colunasValidas.length} colunas verificadas)`);
    }
  }
  linhas.push('');

  linhas.push(`3. Supabase Storage (Fotos de Livros):`);
  if (resultado.storage.ok) {
    linhas.push(`   • Bucket '${resultado.storage.bucket}': ✔  OK (público e acessível)\n`);
  } else {
    linhas.push(`   • Bucket '${resultado.storage.bucket}': ❌ ${resultado.storage.erro || 'Falha no Storage'}\n`);
  }

  linhas.push(`4. Funções RPC Transacionais:`);
  for (const [nome, r] of Object.entries(resultado.rpc.funcoes || {})) {
    if (r.existe) {
      linhas.push(`   • public.${nome.padEnd(24)} ✔  OK (${r.descricao})`);
    } else {
      linhas.push(`   • public.${nome.padEnd(24)} ❌ AUSENTE (${r.descricao})`);
    }
  }
  linhas.push('');

  linhas.push(`5. Reconciliação com Migrações Locais (supabase/migrations/):`);
  linhas.push(`   Total: ${resultado.reconciliacao.total} | Aplicadas: ${resultado.reconciliacao.aplicadas} | Pendentes: ${resultado.reconciliacao.pendentes}`);
  for (const m of resultado.reconciliacao.migracoes) {
    const icone = m.status === 'APLICADA' ? '✔ ' : '⏳';
    linhas.push(`   • ${icone} [${m.status.padEnd(9)}] ${m.arquivo} — ${m.titulo}`);
  }
  linhas.push('');

  linhas.push('═══════════════════════════════════════════════════════════════════════');
  if (resultado.ok) {
    linhas.push('  ✔ SUCESSO: Backend remoto 100% íntegro e sincronizado com o código. ');
  } else {
    linhas.push('  ⚠️  PENDÊNCIAS DETECTADAS NO BACKEND REMOTO:                        ');
    for (const p of resultado.pendencias) {
      linhas.push(`     - ${p}`);
    }
    linhas.push('\n  Ação: aplique os arquivos SQL pendentes listados acima no painel     ');
    linhas.push('  do Supabase (SQL Editor) ou através do comando supabase db push.    ');
  }
  linhas.push('═══════════════════════════════════════════════════════════════════════');

  return linhas.join('\n');
}

/**
 * Emite os resultados do diagnóstico em formato JSON estruturado.
 */
export function gerarRelatorioJson(resultado) {
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      ok: resultado.ok,
      configOk: resultado.configOk,
      url: resultado.maskedUrl || '',
      conectividade: resultado.conectividade,
      tabelas: resultado.tabelas?.tabelas || {},
      storage: resultado.storage,
      rpc: resultado.rpc?.funcoes || {},
      migracoes: resultado.reconciliacao,
      pendencias: resultado.pendencias || [],
    },
    null,
    2
  );
}

// Execução como script de linha de comando
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(`
Uso: npm run health:supabase:remote [opções]

Opções:
  --json            Emite relatório estruturado em formato JSON puro
  --allow-pending   Retorna código de saída 0 mesmo se houver migrações pendentes
  --help, -h        Exibe esta mensagem de ajuda
\n`);
    process.exit(0);
  }

  const emiteJson = args.includes('--json');
  const allowPending = args.includes('--allow-pending');

  const resultado = await executarDiagnosticoRemoto();

  if (emiteJson) {
    process.stdout.write(gerarRelatorioJson(resultado) + '\n');
  } else {
    process.stdout.write(formatarRelatorioTerminal(resultado) + '\n');
  }

  if (resultado.ok) {
    process.exit(0);
  }

  if (allowPending && resultado.conectividade?.ok) {
    process.exit(0);
  }

  process.exit(1);
}
