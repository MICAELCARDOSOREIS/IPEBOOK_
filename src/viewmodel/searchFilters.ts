import type { Book, BookCondition, BookModality } from "@/model/entities/book";
import { BOOK_CONDITION_LABELS } from "@/model/entities/book";

export type SearchModalityFilter = BookModality | "all";
export type SearchPriceRange = "all" | "free" | "under20" | "under50";
export type SearchSortOption = "recent" | "title" | "price_asc" | "price_desc";
/** Conservação do exemplar: "all" ou uma das condições do catálogo (Figma `02.03` e `34:229`). */
export type SearchConditionFilter = "all" | BookCondition;

/** Parâmetros que restringem o catálogo na Pesquisa (Figma `02.03 · Filtrar livros`). */
export type SearchFilters = Readonly<{
  modality: SearchModalityFilter;
  category: string | "all";
  condition: SearchConditionFilter;
  priceRange: SearchPriceRange;
}>;

export type SearchFilterKey = "modality" | "category" | "condition" | "priceRange";

/** Filtro já aplicado, exibido como chip removível no Figma `02.04 · Explorar com filtro`. */
export type ActiveFilter = Readonly<{
  key: SearchFilterKey;
  label: string;
}>;

export type SearchQuery = Readonly<{
  term: string;
  filters: SearchFilters;
  neighborhood: string | "all";
}>;

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  modality: "all",
  category: "all",
  condition: "all",
  priceRange: "all",
};

export const MODALITY_FILTER_LABELS: Readonly<Record<SearchModalityFilter, string>> = {
  all: "Todas",
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

export const PRICE_FILTER_LABELS: Readonly<Record<SearchPriceRange, string>> = {
  all: "Todos os preços",
  free: "Grátis",
  under20: "Até R$ 20",
  under50: "Até R$ 50",
};

export const CONDITION_FILTER_LABELS: Readonly<Record<SearchConditionFilter, string>> = {
  all: "Todas as condições",
  ...BOOK_CONDITION_LABELS,
};

export const SORT_LABELS: Readonly<Record<SearchSortOption, string>> = {
  recent: "Mais recentes",
  title: "A-Z",
  price_asc: "Menor preço",
  price_desc: "Maior preço",
};

/** Trecho do resumo do Figma `02.04`: "1 livro à venda · Literatura". */
const MODALITY_SUMMARY: Readonly<Record<BookModality, string>> = {
  sale: "à venda",
  trade: "para troca",
  donation: "para doação",
};

export function matchesTerm(book: Book, normalizedTerm: string): boolean {
  return (
    book.title.toLowerCase().includes(normalizedTerm) ||
    book.author.toLowerCase().includes(normalizedTerm) ||
    (book.category?.toLowerCase().includes(normalizedTerm) ?? false)
  );
}

export function matchesPrice(book: Book, range: SearchPriceRange): boolean {
  if (range === "all") return true;
  if (range === "free") {
    return book.modality === "donation" || (book.price !== undefined && book.price === 0);
  }
  const price = book.price ?? 0;
  if (range === "under20") {
    return price > 0 && price <= 20;
  }
  if (range === "under50") {
    return price > 0 && price <= 50;
  }
  return true;
}

/**
 * "Bom estado" aceita exemplares sem conservação informada (pois o detalhe do anúncio já
 * apresenta esse caso como "Bom estado"). Condições específicas ("new", "marked", "worn")
 * exigem que o exemplar tenha exatamente aquela condição informada.
 */
export function matchesCondition(book: Book, condition: SearchConditionFilter): boolean {
  if (condition === "all") return true;
  if (condition === "good") {
    return book.condition === undefined || book.condition === "good";
  }
  return book.condition === condition;
}

function matchesNeighborhood(book: Book, neighborhood: string): boolean {
  if (neighborhood === "all" || neighborhood === "Todos os bairros") return true;
  return book.neighborhood?.trim().toLowerCase() === neighborhood.trim().toLowerCase();
}

/** Filtra o catálogo client-side (FR-005, Spec 028): termo, modalidade, categoria, preço e bairro. */
export function filterBooks(books: readonly Book[], query: SearchQuery): Book[] {
  const normalizedTerm = query.term.trim().toLowerCase();
  const normalizedCategory = query.filters.category.trim().toLowerCase();
  return books.filter((book) => {
    if (normalizedTerm && !matchesTerm(book, normalizedTerm)) return false;
    if (query.filters.modality !== "all" && book.modality !== query.filters.modality) return false;
    if (query.filters.category !== "all" && book.category?.trim().toLowerCase() !== normalizedCategory) return false;
    if (!matchesNeighborhood(book, query.neighborhood)) return false;
    if (!matchesPrice(book, query.filters.priceRange)) return false;
    return matchesCondition(book, query.filters.condition);
  });
}

/** Ordena sem mutar a lista recebida; `recent` preserva a ordem do datasource. */
export function sortBooks(books: readonly Book[], sortBy: SearchSortOption): Book[] {
  if (sortBy === "title") {
    return [...books].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  }
  if (sortBy === "price_asc") {
    return [...books].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }
  if (sortBy === "price_desc") {
    return [...books].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  }
  return [...books];
}

export function countActiveFilters(filters: SearchFilters): number {
  return activeFilters(filters).length;
}

/** Filtros aplicados (na ordem do Figma `02.04`), com o rótulo já pronto para o chip removível. */
export function activeFilters(filters: SearchFilters): ActiveFilter[] {
  const list: ActiveFilter[] = [];
  if (filters.modality !== "all") {
    list.push({ key: "modality", label: MODALITY_FILTER_LABELS[filters.modality] });
  }
  if (filters.category !== "all") {
    list.push({ key: "category", label: filters.category });
  }
  if (filters.condition !== "all") {
    list.push({ key: "condition", label: CONDITION_FILTER_LABELS[filters.condition] });
  }
  if (filters.priceRange !== "all") {
    list.push({ key: "priceRange", label: PRICE_FILTER_LABELS[filters.priceRange] });
  }
  return list;
}

/** Remove um filtro do chip correspondente, mantendo os demais. */
export function removeFilter(filters: SearchFilters, key: SearchFilterKey): SearchFilters {
  if (key === "modality") return { ...filters, modality: "all" };
  if (key === "category") return { ...filters, category: "all" };
  if (key === "condition") return { ...filters, condition: "all" };
  return { ...filters, priceRange: "all" };
}

/** Resumo da faixa de resultados do Figma `02.04`: "1 livro à venda · Literatura · Bom estado". */
export function describeResults(count: number, filters: SearchFilters): string {
  const countLabel = `${count} ${count === 1 ? "livro" : "livros"}`;
  const head = filters.modality === "all" ? countLabel : `${countLabel} ${MODALITY_SUMMARY[filters.modality]}`;
  const details: string[] = [];
  if (filters.category !== "all") {
    details.push(filters.category);
  }
  if (filters.condition !== "all") {
    details.push(CONDITION_FILTER_LABELS[filters.condition]);
  }
  if (filters.priceRange !== "all") {
    details.push(PRICE_FILTER_LABELS[filters.priceRange]);
  }
  return details.length > 0 ? `${head} · ${details.join(" · ")}` : head;
}
