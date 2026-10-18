import { describe, it, expect } from 'vitest';
import { LIVROS_SEMENTE_PIRIPIRI, gerarSqlSeed } from '../../scripts/popular-catalogo-piripiri.mjs';
import { PIRIPIRI_NEIGHBORHOODS, DEFAULT_BETA_CITY, DEFAULT_BETA_STATE } from '@/model/entities/location';

describe('Semente do Catálogo da Beta — Piripiri, PI', () => {
  it('contém pelo menos 10 livros cobrindo múltiplas modalidades', () => {
    expect(LIVROS_SEMENTE_PIRIPIRI.length).toBeGreaterThanOrEqual(10);
    const modalidades = new Set(LIVROS_SEMENTE_PIRIPIRI.map((l) => l.modality));
    expect(modalidades.has('sale')).toBe(true);
    expect(modalidades.has('trade')).toBe(true);
    expect(modalidades.has('donation')).toBe(true);
  });

  it('todos os livros respeitam a regra de restrição territorial a Piripiri, PI', () => {
    for (const livro of LIVROS_SEMENTE_PIRIPIRI) {
      expect(livro.city).toBe(DEFAULT_BETA_CITY);
      expect(livro.state).toBe(DEFAULT_BETA_STATE);
      expect(PIRIPIRI_NEIGHBORHOODS).toContain(livro.neighborhood);
    }
  });

  it('anúncios com modalidade venda possuem preço positivo', () => {
    for (const livro of LIVROS_SEMENTE_PIRIPIRI) {
      if (livro.modality === 'sale') {
        expect(livro.price).toBeGreaterThan(0);
      } else {
        expect(livro.price).toBeNull();
      }
    }
  });

  it('gera SQL com declaração de insert e tratamentos de aspas', () => {
    const ownerId = '99999999-9999-4999-8999-999999999999';
    const sql = gerarSqlSeed(ownerId);
    expect(sql).toContain('insert into public.v2_books');
    expect(sql).toContain(ownerId);
    expect(sql).toContain('Dom Casmurro');
    expect(sql).toContain('Paciência');
    expect(sql).toContain('on conflict do nothing;');
  });
});
