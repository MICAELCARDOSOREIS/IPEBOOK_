import { describe, it, expect } from 'vitest';
import {
  agregarMetricasBeta,
  formatarRelatorioTerminal,
  formatarRelatorioMarkdown,
  gerarRelatorioJson,
  validarConformidadeLgpd,
  PIRIPIRI_NEIGHBORHOODS,
  LGPD_FORBIDDEN_KEYS,
  executarAuditoriaBeta,
} from '../../scripts/auditoria-metricas-beta.mjs';
import { PIRIPIRI_NEIGHBORHOODS as OFFICIAL_PIRIPIRI_NEIGHBORHOODS } from '@/model/entities/location';

describe('Auditoria e Métricas Agregadas da Beta — Piripiri, PI (Spec 047)', () => {
  it('contém exatamente os 17 bairros oficiais de Piripiri em conformidade com location.ts', () => {
    expect(PIRIPIRI_NEIGHBORHOODS).toEqual(OFFICIAL_PIRIPIRI_NEIGHBORHOODS);
    expect(PIRIPIRI_NEIGHBORHOODS.length).toBe(17);
  });

  it('agrega corretamente estatísticas de livros por bairro, modalidade e status', () => {
    const livrosAmostra = [
      {
        id: '1',
        owner_id: 'user-a',
        modality: 'donation',
        price: null,
        status: 'available',
        city: 'Piripiri',
        state: 'PI',
        neighborhood: 'Centro',
      },
      {
        id: '2',
        owner_id: 'user-a',
        modality: 'trade',
        price: null,
        status: 'reserved',
        city: 'Piripiri',
        state: 'PI',
        neighborhood: 'Centro',
      },
      {
        id: '3',
        owner_id: 'user-b',
        modality: 'sale',
        price: 30.0,
        status: 'available',
        city: 'Piripiri',
        state: 'PI',
        neighborhood: 'Paciência',
      },
      {
        id: '4',
        owner_id: 'user-b',
        modality: 'sale',
        price: 50.0,
        status: 'paused',
        city: 'Piripiri',
        state: 'PI',
        neighborhood: 'Paciência',
      },
      {
        id: '5',
        owner_id: 'user-c',
        modality: 'trade',
        price: null,
        status: 'available',
        city: 'Piripiri',
        state: 'PI',
        neighborhood: 'Petecas',
      },
    ];

    const metricas = agregarMetricasBeta(livrosAmostra, [], {
      origem: 'teste_unitario',
      data: '2026-10-21T00:00:00.000Z',
    });

    // Visão Geral
    expect(metricas.geral.totalLivros).toBe(5);
    expect(metricas.geral.totalAnunciantesUnicos).toBe(3);
    expect(metricas.geral.mediaLivrosPorAnunciante).toBe(1.67);
    expect(metricas.geral.coberturaBairros.bairrosComOferta).toBe(3); // Centro, Paciência, Petecas
    expect(metricas.geral.coberturaBairros.totalBairrosOficiais).toBe(17);
    expect(metricas.geral.coberturaBairros.taxaCobertura).toBe(17.6);

    // Modalidades
    expect(metricas.modalidades.doacao.total).toBe(1);
    expect(metricas.modalidades.doacao.percentual).toBe(20.0);
    expect(metricas.modalidades.troca.total).toBe(2);
    expect(metricas.modalidades.troca.percentual).toBe(40.0);
    expect(metricas.modalidades.venda.total).toBe(2);
    expect(metricas.modalidades.venda.percentual).toBe(40.0);
    expect(metricas.modalidades.venda.precoMedio).toBe(40.0);
    expect(metricas.modalidades.venda.precoMinimo).toBe(30.0);
    expect(metricas.modalidades.venda.precoMaximo).toBe(50.0);

    // Status
    expect(metricas.statusAnuncios.disponivel.total).toBe(3);
    expect(metricas.statusAnuncios.disponivel.percentual).toBe(60.0);
    expect(metricas.statusAnuncios.reservado.total).toBe(1);
    expect(metricas.statusAnuncios.reservado.percentual).toBe(20.0);
    expect(metricas.statusAnuncios.pausado.total).toBe(1);
    expect(metricas.statusAnuncios.pausado.percentual).toBe(20.0);

    // Bairros
    const centro = metricas.distribuicaoBairros.find((b) => b.bairro === 'Centro');
    expect(centro?.total).toBe(2);
    expect(centro?.disponiveis).toBe(1);
    expect(centro?.reservados).toBe(1);
    expect(centro?.doacao).toBe(1);
    expect(centro?.troca).toBe(1);
    expect(centro?.percentual).toBe(40.0);

    const paciencia = metricas.distribuicaoBairros.find((b) => b.bairro === 'Paciência');
    expect(paciencia?.total).toBe(2);
    expect(paciencia?.venda).toBe(2);
    expect(paciencia?.pausados).toBe(1);
    expect(paciencia?.percentual).toBe(40.0);
  });

  it('agrega métricas de pedidos e negociações com taxa de sucesso', () => {
    const pedidos = [
      { id: 'p1', status: 'pending', proposed_modality: 'trade' },
      { id: 'p2', status: 'accepted', proposed_modality: 'donation' },
      { id: 'p3', status: 'completed', proposed_modality: 'sale' },
      { id: 'p4', status: 'rejected', proposed_modality: 'trade' },
    ];

    const metricas = agregarMetricasBeta([], pedidos);
    expect(metricas.negociacoes.totalPedidos).toBe(4);
    expect(metricas.negociacoes.porStatus.pendente).toBe(1);
    expect(metricas.negociacoes.porStatus.aceito).toBe(1);
    expect(metricas.negociacoes.porStatus.concluido).toBe(1);
    expect(metricas.negociacoes.porStatus.rejeitado).toBe(1);
    expect(metricas.negociacoes.porModalidade.troca).toBe(2);
    expect(metricas.negociacoes.porModalidade.doacao).toBe(1);
    expect(metricas.negociacoes.porModalidade.venda).toBe(1);
    expect(metricas.negociacoes.taxaSucesso).toBe(50.0); // 2 aceitos/concluidos de 4
  });

  it('lida com base vazia sem erros de divisão por zero ou NaN', () => {
    const metricas = agregarMetricasBeta([], []);
    expect(metricas.geral.totalLivros).toBe(0);
    expect(metricas.geral.totalAnunciantesUnicos).toBe(0);
    expect(metricas.geral.mediaLivrosPorAnunciante).toBe(0);
    expect(metricas.geral.coberturaBairros.taxaCobertura).toBe(0);
    expect(metricas.modalidades.venda.precoMedio).toBeNull();
    expect(metricas.negociacoes.taxaSucesso).toBe(0);
    expect(metricas.distribuicaoBairros.length).toBe(17);
  });

  it('atribui bairros desconhecidos ou vazios a "Não informado"', () => {
    const livros = [
      { id: '1', owner_id: 'u1', neighborhood: null, modality: 'trade', status: 'available' },
      { id: '2', owner_id: 'u2', neighborhood: 'Zona Rural Piripiri', modality: 'donation', status: 'available' },
    ];
    const metricas = agregarMetricasBeta(livros);
    const naoInformado = metricas.distribuicaoBairros.find((b) => b.bairro === 'Não informado');
    const zonaRural = metricas.distribuicaoBairros.find((b) => b.bairro === 'Zona Rural Piripiri');

    expect(naoInformado?.total).toBe(1);
    expect(naoInformado?.oficialPiripiri).toBe(false);
    expect(zonaRural?.total).toBe(1);
    expect(zonaRural?.oficialPiripiri).toBe(false);
  });

  describe('Conformidade LGPD', () => {
    it('resultado das métricas agregadas passa na validação estrita LGPD', () => {
      const metricas = agregarMetricasBeta([
        { id: '123', owner_id: '11111111-1111-4111-8111-111111111111', neighborhood: 'Centro', modality: 'trade', status: 'available' },
      ]);
      expect(() => validarConformidadeLgpd(metricas)).not.toThrow();
      expect(metricas.conformidadeLgpd.emConformidade).toBe(true);
    });

    it('validarConformidadeLgpd bloqueia chaves proibidas de dados pessoais', () => {
      for (const chave of ['email', 'owner_id', 'user_id', 'phone', 'photo_url']) {
        const payloadInseguro = { geral: { [chave]: 'qualquer_coisa' } };
        expect(() => validarConformidadeLgpd(payloadInseguro)).toThrow(/Violação LGPD detectada/);
      }
    });

    it('validarConformidadeLgpd bloqueia valores contendo formato de e-mail ou UUID', () => {
      expect(() => validarConformidadeLgpd({ detalhe: 'contato@piripiri.com' })).toThrow(/e-mail identificado/);
      expect(() => validarConformidadeLgpd({ detalhe: '11111111-1111-4111-8111-111111111111' })).toThrow(/UUID de titular identificado/);
    });

    it('LGPD_FORBIDDEN_KEYS cobre identificadores pessoais essenciais', () => {
      expect(LGPD_FORBIDDEN_KEYS.has('owner_id')).toBe(true);
      expect(LGPD_FORBIDDEN_KEYS.has('user_id')).toBe(true);
      expect(LGPD_FORBIDDEN_KEYS.has('email')).toBe(true);
      expect(LGPD_FORBIDDEN_KEYS.has('phone')).toBe(true);
      expect(LGPD_FORBIDDEN_KEYS.has('cpf')).toBe(true);
    });
  });

  describe('Formatadores de Saída', () => {
    const metricas = agregarMetricasBeta([
      { id: '1', owner_id: 'u1', neighborhood: 'Centro', modality: 'donation', status: 'available', price: null },
      { id: '2', owner_id: 'u2', neighborhood: 'Paciência', modality: 'sale', status: 'available', price: 35.0 },
    ]);

    it('formatarRelatorioTerminal gera relatório visual com tabelas e resumo', () => {
      const saida = formatarRelatorioTerminal(metricas);
      expect(saida).toContain('IpêBook — Relatório de Auditoria e Métricas da Beta (Piripiri, PI)');
      expect(saida).toContain('Centro');
      expect(saida).toContain('Paciência');
      expect(saida).toContain('Doação');
      expect(saida).toContain('Venda');
      expect(saida).toContain('Conformidade LGPD garantida por design');
    });

    it('formatarRelatorioMarkdown gera documento Markdown com tabelas GFM', () => {
      const markdown = formatarRelatorioMarkdown(metricas);
      expect(markdown).toContain('# Relatório de Auditoria e Métricas da Beta — Piripiri, PI');
      expect(markdown).toContain('## 1. Visão Geral Operacional');
      expect(markdown).toContain('## 4. Distribuição Territorial por Bairro de Piripiri');
      expect(markdown).toContain('| Centro | 1 | 50% |');
      expect(markdown).toContain('## 6. Declaração de Conformidade com a LGPD');
    });

    it('gerarRelatorioJson gera JSON parseável e sem chaves de identificação', () => {
      const jsonStr = gerarRelatorioJson(metricas);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.geral.totalLivros).toBe(2);
      expect(parsed.modalidades.doacao.total).toBe(1);
      expect(parsed.modalidades.venda.total).toBe(1);
      expect(parsed.conformidadeLgpd.emConformidade).toBe(true);
      expect(parsed).not.toHaveProperty('owner_id');
      expect(parsed).not.toHaveProperty('email');
    });
  });

  describe('Execução CLI', () => {
    it('--help emite instrução de uso e retorna código 0', async () => {
      const code = await executarAuditoriaBeta(['--help']);
      expect(code).toBe(0);
    });
  });
});
