import { describe, it, expect, vi } from 'vitest';
import {
  mascararUrl,
  carregarConfiguracaoAmbiente,
  verificarConectividade,
  verificarTabelasEColunas,
  verificarStorage,
  verificarFuncoesRpc,
  reconciliarMigracoesLocais,
  executarDiagnosticoRemoto,
  formatarRelatorioTerminal,
  gerarRelatorioJson,
  TABELAS_CRITICAS,
} from '../../scripts/verificar-migracoes-remotas.mjs';

describe('Diagnóstico de Saúde e Migrações do Supabase Remoto (Spec 049 / ADR 0033)', () => {
  describe('mascararUrl', () => {
    it('mascara URLs válidas preservando protocolo e host sem vazar paths ou credenciais', () => {
      expect(mascararUrl('https://xyz.supabase.co/rest/v1/')).toBe('https://xyz.supabase.co');
      expect(mascararUrl('http://localhost:54321/api')).toBe('http://localhost:54321');
    });

    it('trata valores indefinidos ou inválidos com fallback seguro', () => {
      expect(mascararUrl('')).toBe('(indefinida)');
      expect(mascararUrl(null as any)).toBe('(indefinida)');
      expect(mascararUrl('texto-invalido')).toBe('texto-invalido');
    });
  });

  describe('carregarConfiguracaoAmbiente', () => {
    it('retorna erro amigável se variáveis de ambiente estiverem ausentes', () => {
      const resultado = carregarConfiguracaoAmbiente({});
      expect(resultado.ok).toBe(false);
      expect(resultado.error).toContain('EXPO_PUBLIC_SUPABASE_URL');
      expect(resultado.error).toContain('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    });

    it('carrega e sanitiza URL com sucesso quando fornecidas', () => {
      const resultado = carregarConfiguracaoAmbiente({
        EXPO_PUBLIC_SUPABASE_URL: 'https://projeto-teste.supabase.co///',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_pub_chave_teste',
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.supabaseUrl).toBe('https://projeto-teste.supabase.co');
      expect(resultado.supabaseKey).toBe('sb_pub_chave_teste');
      expect(resultado.maskedUrl).toBe('https://projeto-teste.supabase.co');
    });
  });

  describe('verificarConectividade', () => {
    it('retorna ok: true quando o endpoint responde com status HTTP 200', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const resultado = await verificarConectividade('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(true);
      expect(resultado.status).toBe(200);
      expect(resultado.latencyMs).toBeGreaterThanOrEqual(0);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://exemplo.supabase.co/rest/v1/v2_books?limit=1',
        expect.objectContaining({
          method: 'GET',
          headers: {
            apikey: 'chave-123',
            Authorization: 'Bearer chave-123',
          },
        })
      );
    });

    it('retorna erro se o endpoint responder com código de erro HTTP (ex: 500)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const resultado = await verificarConectividade('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.status).toBe(500);
      expect(resultado.error).toContain('500');
    });

    it('trata exceção de rede de forma graciosa sem lançar unhandled rejection', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Conexão recusada pelo host'));

      const resultado = await verificarConectividade('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.error).toContain('Conexão recusada');
    });
  });

  describe('verificarTabelasEColunas', () => {
    it('valida todas as tabelas e colunas quando PostgREST responde OK', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const resultado = await verificarTabelasEColunas('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(true);

      for (const chave of Object.keys(TABELAS_CRITICAS)) {
        expect(resultado.tabelas[chave]).toBeDefined();
        expect(resultado.tabelas[chave].existe).toBe(true);
        expect(resultado.tabelas[chave].ok).toBe(true);
        expect(resultado.tabelas[chave].colunasAusentes).toHaveLength(0);
      }
    });

    it('detecta tabela ausente com status 404', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('v2_user_preferences')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200 });
      });

      const resultado = await verificarTabelasEColunas('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.tabelas.v2_user_preferences.existe).toBe(false);
      expect(resultado.tabelas.v2_user_preferences.ok).toBe(false);
      expect(resultado.tabelas.v2_user_preferences.erro).toContain('não encontrada');
    });

    it('detecta colunas ausentes individuais quando PostgREST retorna 400', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('v2_search_alerts')) {
          // Se consultar com todas as colunas juntas, falha (400)
          if (url.includes('modalities') && url.includes('query')) {
            return Promise.resolve({ ok: false, status: 400 });
          }
          // Se consultar individualmente a coluna ausente modalities
          if (url.includes('modalities')) {
            return Promise.resolve({ ok: false, status: 400 });
          }
          return Promise.resolve({ ok: true, status: 200 });
        }
        return Promise.resolve({ ok: true, status: 200 });
      });

      const resultado = await verificarTabelasEColunas('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      const alerts = resultado.tabelas.v2_search_alerts;
      expect(alerts.existe).toBe(true);
      expect(alerts.ok).toBe(false);
      expect(alerts.colunasAusentes).toContain('modalities');
      expect(alerts.colunasValidas).toContain('query');
    });
  });

  describe('verificarStorage', () => {
    it('identifica bucket público existente quando probe e listagem sucedem', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('public/book-photos')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ statusCode: '404', error: 'not_found', code: 'NoSuchKey' }),
          });
        }
        if (url.includes('object/list/book-photos')) {
          return Promise.resolve({
            ok: true,
            status: 200,
          });
        }
        return Promise.resolve({ ok: true, status: 200, text: async () => '' });
      });

      const resultado = await verificarStorage('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(true);
      expect(resultado.bucket).toBe('book-photos');
      expect(resultado.publico).toBe(true);
      expect(resultado.listagemOk).toBe(true);
    });

    it('identifica falha quando o bucket não existe (NoSuchBucket)', async () => {
      const mockFetch = vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 400,
          text: async () => JSON.stringify({ error: 'Bucket not found', code: 'NoSuchBucket' }),
        });
      });

      const resultado = await verificarStorage('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.erro).toContain('Bucket \'book-photos\' não existe');
    });

    it('trata exceção de rede no storage de forma resiliente', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Storage indisponível'));

      const resultado = await verificarStorage('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.erro).toContain('Storage indisponível');
    });
  });

  describe('verificarFuncoesRpc', () => {
    it('detecta funções RPC existentes no schema cache', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Não autorizado a excluir esta conta', code: 'P0001' }),
      });

      const resultado = await verificarFuncoesRpc('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(true);
      expect(resultado.funcoes.delete_user_account.existe).toBe(true);
      expect(resultado.funcoes.accept_book_request.existe).toBe(true);
    });

    it('identifica RPC ausente com código PGRST202 do PostgREST', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('accept_book_request')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: async () => JSON.stringify({ code: 'PGRST202', message: 'Could not find the function' }),
          });
        }
        return Promise.resolve({
          ok: false,
          status: 400,
          text: async () => JSON.stringify({ code: 'P0001', message: 'Negócio' }),
        });
      });

      const resultado = await verificarFuncoesRpc('https://exemplo.supabase.co', 'chave-123', mockFetch);
      expect(resultado.ok).toBe(false);
      expect(resultado.funcoes.accept_book_request.existe).toBe(false);
      expect(resultado.funcoes.delete_user_account.existe).toBe(true);
    });
  });

  describe('reconciliarMigracoesLocais', () => {
    it('marca todas as migrações como APLICADA quando todos os artefatos estão presentes', () => {
      const contextoDiagnostico = {
        conectividade: { ok: true },
        tabelas: {
          v2_books: { existe: true, colunasValidas: ['title', 'photo_url', 'neighborhood', 'status', 'condition', 'description'] },
          v2_book_requests: { existe: true },
          v2_favorites: { existe: true },
          v2_search_alerts: { existe: true, colunasValidas: ['modalities'] },
          v2_notifications: { existe: true },
          v2_reports: { existe: true },
          v2_profiles: { existe: true, colunasValidas: ['photo_url', 'social_handle'] },
          v2_ratings: { existe: true },
          v2_user_preferences: { existe: true },
          v2_meetings: { existe: true },
          v2_blocked_users: { existe: true },
        },
        storage: { ok: true, publico: true },
        rpc: {
          funcoes: {
            delete_user_account: { existe: true },
            accept_book_request: { existe: true },
          },
        },
      };

      const resultado = reconciliarMigracoesLocais('supabase/migrations', contextoDiagnostico);
      expect(resultado.total).toBe(20);
      expect(resultado.aplicadas).toBe(20);
      expect(resultado.pendentes).toBe(0);
      expect(resultado.migracoes.every((m: any) => m.status === 'APLICADA')).toBe(true);
    });

    it('marca como PENDENTE as migrações cujos artefatos estão ausentes', () => {
      const contextoParcial = {
        conectividade: { ok: true },
        tabelas: {
          v2_books: { existe: true, colunasValidas: ['title', 'photo_url', 'neighborhood', 'status', 'condition', 'description'] },
          v2_book_requests: { existe: true },
          v2_favorites: { existe: true },
          v2_search_alerts: { existe: true, colunasValidas: ['query'] }, // sem modalities
          v2_notifications: { existe: true },
          v2_reports: { existe: true },
          v2_profiles: { existe: true, colunasValidas: ['name'] }, // sem photo_url, social_handle
          v2_ratings: { existe: true },
          v2_user_preferences: { existe: false }, // tabela ausente
          v2_meetings: { existe: false }, // encontros da Spec 052 ainda não aplicados
          v2_blocked_users: { existe: false }, // bloqueios da Spec 056 ainda não aplicados
        },
        storage: { ok: true, publico: true },
        rpc: {
          funcoes: {
            delete_user_account: { existe: true },
            accept_book_request: { existe: false }, // rpc ausente
          },
        },
      };

      const resultado = reconciliarMigracoesLocais('supabase/migrations', contextoParcial);
      expect(resultado.total).toBe(20);
      expect(resultado.aplicadas).toBe(14);
      expect(resultado.pendentes).toBe(6);

      const pendentes = resultado.migracoes.filter((m: any) => m.status === 'PENDENTE');
      const arquivosPendentes = pendentes.map((m: any) => m.arquivo);
      expect(arquivosPendentes).toContain('202610200007_edicao_perfil_proprio.sql');
      expect(arquivosPendentes).toContain('202610200008_avaliacoes_e_aceite_atomico.sql');
      expect(arquivosPendentes).toContain('202610210001_preferencias_privadas_perfil.sql');
      expect(arquivosPendentes).toContain('202610210002_modalidades_alerta_busca.sql');
      expect(arquivosPendentes).toContain('202610220001_encontros.sql');
      expect(arquivosPendentes).toContain('202610230002_bloqueio_usuarios.sql');
    });
  });

  describe('executarDiagnosticoRemoto e formatadores', () => {
    it('executa diagnóstico completo e formata terminal e json com sucesso', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('public/book-photos')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ code: 'NoSuchKey' }),
          });
        }
        if (url.includes('object/list/book-photos')) {
          return Promise.resolve({ ok: true, status: 200 });
        }
        if (url.includes('/rpc/')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ code: 'P0001' }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, text: async () => '' });
      });

      const diagnostico = await executarDiagnosticoRemoto({
        envCustom: {
          EXPO_PUBLIC_SUPABASE_URL: 'https://projeto-vitest.supabase.co',
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_chave_vitest',
        },
        fetchFn: mockFetch,
      });

      expect(diagnostico.ok).toBe(true);
      expect(diagnostico.pendencias).toHaveLength(0);

      const relatorioTerminal = formatarRelatorioTerminal(diagnostico);
      expect(relatorioTerminal).toContain('IpêBook — Diagnóstico de Saúde e Migrações');
      expect(relatorioTerminal).toContain('https://projeto-vitest.supabase.co');
      expect(relatorioTerminal).toContain('SUCESSO: Backend remoto 100% íntegro');

      const relatorioJson = gerarRelatorioJson(diagnostico);
      const parsed = JSON.parse(relatorioJson);
      expect(parsed.ok).toBe(true);
      expect(parsed.url).toBe('https://projeto-vitest.supabase.co');
      expect(parsed.migracoes.total).toBe(20);
    });

    it('formata adequadamente falhas e pendências detectadas', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('v2_user_preferences')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        if (url.includes('public/book-photos')) {
          return Promise.resolve({
            ok: false,
            status: 400,
            text: async () => JSON.stringify({ code: 'NoSuchBucket' }),
          });
        }
        if (url.includes('accept_book_request')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: async () => JSON.stringify({ code: 'PGRST202' }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, text: async () => '' });
      });

      const diagnostico = await executarDiagnosticoRemoto({
        envCustom: {
          EXPO_PUBLIC_SUPABASE_URL: 'https://projeto-vitest.supabase.co',
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_chave_vitest',
        },
        fetchFn: mockFetch,
      });

      expect(diagnostico.ok).toBe(false);
      expect(diagnostico.pendencias.length).toBeGreaterThan(0);

      const relatorioTerminal = formatarRelatorioTerminal(diagnostico);
      expect(relatorioTerminal).toContain('PENDÊNCIAS DETECTADAS NO BACKEND REMOTO');
      expect(relatorioTerminal).toContain('v2_user_preferences');

      const relatorioJson = gerarRelatorioJson(diagnostico);
      const parsed = JSON.parse(relatorioJson);
      expect(parsed.ok).toBe(false);
      expect(parsed.pendencias.length).toBeGreaterThan(0);
    });

    it('formata erro de configuração de ambiente de forma clara', () => {
      const resultadoInvalido = {
        ok: false,
        configOk: false,
        erroConfiguracao: 'Variáveis ausentes',
      };

      const texto = formatarRelatorioTerminal(resultadoInvalido as any);
      expect(texto).toContain('Configuração de Ambiente: FALHA');
      expect(texto).toContain('Variáveis ausentes');
    });
  });
});
