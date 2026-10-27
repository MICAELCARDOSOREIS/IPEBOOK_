import { describe, expect, it } from "vitest";
import type { Book } from "@/model/entities/book";
import {
  DEFAULT_SEARCH_FILTERS,
  activeFilters,
  countActiveFilters,
  describeResults,
  filterBooks,
  matchesCondition,
  matchesPrice,
  removeFilter,
  sortBooks,
  type SearchFilters,
} from "@/viewmodel/searchFilters";

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "other",
  modality: "sale",
  price: 25,
  status: "available",
  ...over,
});

const withFilters = (patch: Partial<SearchFilters>): SearchFilters => ({ ...DEFAULT_SEARCH_FILTERS, ...patch });

describe("searchFilters (Spec 028 · Figma 02.03/02.04)", () => {
  it("considera bom estado quando a conservação não foi informada", () => {
    expect(matchesCondition(book({}), "good")).toBe(true);
    expect(matchesCondition(book({ condition: "good" }), "good")).toBe(true);
    expect(matchesCondition(book({ condition: "new" }), "good")).toBe(false);
    expect(matchesCondition(book({ condition: "worn" }), "good")).toBe(false);
    expect(matchesCondition(book({ condition: "worn" }), "all")).toBe(true);
    expect(matchesCondition(book({ condition: "new" }), "new")).toBe(true);
    expect(matchesCondition(book({ condition: "marked" }), "marked")).toBe(true);
    expect(matchesCondition(book({ condition: "worn" }), "worn")).toBe(true);
    expect(matchesCondition(book({ condition: "good" }), "new")).toBe(false);
  });

  it("trata doação e preço zero como gratuitos e exclui gratuitos das faixas pagas", () => {
    expect(matchesPrice(book({ modality: "donation" }), "free")).toBe(true);
    expect(matchesPrice(book({ price: 0 }), "free")).toBe(true);
    expect(matchesPrice(book({ price: 15 }), "under20")).toBe(true);
    expect(matchesPrice(book({ price: 0 }), "under20")).toBe(false);
    expect(matchesPrice(book({ price: 35 }), "under20")).toBe(false);
    expect(matchesPrice(book({ price: 35 }), "under50")).toBe(true);
  });

  it("combina termo, bairro e filtros de forma cumulativa", () => {
    const books = [
      book({ id: "1", category: "Ficção", neighborhood: "Centro", condition: "good" }),
      book({ id: "2", category: "Ficção", neighborhood: "Petecas", condition: "worn" }),
      book({ id: "3", category: "Didáticos", neighborhood: "Centro", condition: "good" }),
    ];

    expect(filterBooks(books, { term: "", filters: DEFAULT_SEARCH_FILTERS, neighborhood: "all" })).toHaveLength(3);
    expect(
      filterBooks(books, { term: "casmurro", filters: withFilters({ category: "Ficção" }), neighborhood: "Centro" }),
    ).toEqual([books[0]]);
    expect(
      filterBooks(books, { term: "", filters: withFilters({ condition: "good" }), neighborhood: "all" }),
    ).toEqual([books[0], books[2]]);
  });

  it("ordena sem mutar a lista recebida", () => {
    const books = [book({ id: "1", title: "B", price: 40 }), book({ id: "2", title: "A", price: 10 })];
    const sorted = sortBooks(books, "title");

    expect(sorted.map((item) => item.title)).toEqual(["A", "B"]);
    expect(books.map((item) => item.title)).toEqual(["B", "A"]);
    expect(sortBooks(books, "price_asc").map((item) => item.price)).toEqual([10, 40]);
    expect(sortBooks(books, "recent")).toEqual(books);
  });

  it("gera os chips dos filtros aplicados na ordem do Figma 02.04", () => {
    const filters = withFilters({ modality: "trade", category: "Ficção", condition: "good", priceRange: "under20" });

    expect(activeFilters(filters)).toEqual([
      { key: "modality", label: "Troca" },
      { key: "category", label: "Ficção" },
      { key: "condition", label: "Bom estado" },
      { key: "priceRange", label: "Até R$ 20" },
    ]);
    expect(countActiveFilters(filters)).toBe(4);
    expect(countActiveFilters(DEFAULT_SEARCH_FILTERS)).toBe(0);
  });

  it("remove apenas o filtro escolhido", () => {
    const filters = withFilters({ modality: "trade", priceRange: "under20" });

    expect(removeFilter(filters, "modality")).toEqual(withFilters({ priceRange: "under20" }));
    expect(removeFilter(filters, "priceRange")).toEqual(withFilters({ modality: "trade" }));
    expect(removeFilter(filters, "condition")).toEqual(filters);
  });

  it("descreve a faixa de resultados como no Figma 02.04", () => {
    expect(describeResults(0, DEFAULT_SEARCH_FILTERS)).toBe("0 livros");
    expect(describeResults(1, DEFAULT_SEARCH_FILTERS)).toBe("1 livro");
    expect(describeResults(1, withFilters({ modality: "sale", category: "Literatura" }))).toBe(
      "1 livro à venda · Literatura",
    );
    expect(describeResults(3, withFilters({ modality: "donation", condition: "good" }))).toBe(
      "3 livros para doação · Bom estado",
    );
    expect(describeResults(1, withFilters({ modality: "sale", condition: "new" }))).toBe(
      "1 livro à venda · Novo",
    );
    expect(activeFilters(withFilters({ condition: "worn" }))).toEqual([
      { key: "condition", label: "Desgastado" },
    ]);
  });
});
