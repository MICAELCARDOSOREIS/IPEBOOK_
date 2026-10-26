import { useCallback, useEffect, useMemo, useState } from "react";
import { bookUseCases, searchHistoryUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import {
  DEFAULT_SEARCH_FILTERS,
  activeFilters as deriveActiveFilters,
  describeResults,
  filterBooks,
  removeFilter,
  sortBooks,
  type ActiveFilter,
  type SearchConditionFilter,
  type SearchFilterKey,
  type SearchFilters,
  type SearchModalityFilter,
  type SearchPriceRange,
  type SearchSortOption,
} from "@/viewmodel/searchFilters";

export type {
  ActiveFilter,
  SearchConditionFilter,
  SearchFilterKey,
  SearchFilters,
  SearchModalityFilter,
  SearchPriceRange,
  SearchSortOption,
};

export type SearchState = {
  term: string;
  /** Filtros aplicados à lista de resultados. */
  filters: SearchFilters;
  /** Cópia editável exibida em "Filtrar livros" até o toque em "Mostrar N livros". */
  draftFilters: SearchFilters;
  modality: SearchModalityFilter;
  category: string | "all";
  condition: SearchConditionFilter;
  neighborhood: string | "all";
  priceRange: SearchPriceRange;
  sortBy: SearchSortOption;
  availableCategories: readonly string[];
  activeFilters: readonly ActiveFilter[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  /** Resumo do Figma `02.04`: "1 livro à venda · Literatura". */
  resultsSummary: string;
  /** Quantidade que o botão do Figma `02.03` mostra antes de aplicar o rascunho. */
  draftResultCount: number;
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  history: readonly string[];
};

export type SearchActions = {
  setTerm: (term: string) => void;
  setModality: (modality: SearchModalityFilter) => void;
  setCategory: (category: string | "all") => void;
  setCondition: (condition: SearchConditionFilter) => void;
  setNeighborhood: (neighborhood: string | "all") => void;
  setPriceRange: (range: SearchPriceRange) => void;
  setSortBy: (sortBy: SearchSortOption) => void;
  /** Remove só o filtro do chip tocado, mantendo termo e bairro. */
  removeActiveFilter: (key: SearchFilterKey) => void;
  /** Copia os filtros aplicados para o rascunho ao abrir "Filtrar livros". */
  openFilterDraft: () => void;
  updateDraftFilters: (patch: Partial<SearchFilters>) => void;
  /** Aplica o rascunho e fecha a tela de filtros. */
  applyDraftFilters: () => void;
  /** Limpa os filtros (sem apagar o termo nem o bairro) e o rascunho. */
  resetFilters: () => void;
  /** Recomeça a busca do zero, inclusive o termo — usado nos estados vazios. */
  clearFilters: () => void;
  reload: () => Promise<void>;
  registerSearch: (term: string) => Promise<void>;
  clearHistory: () => Promise<void>;
};

/** Busca client-side (FR-005, Spec 028, Issue #93): filtra e ordena o catálogo por termo, modalidade, categoria, preço e conservação. */
export function useSearchViewModel(
  userId: string | null = null,
  books: IBookUseCases = bookUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [SearchState, SearchActions] {
  const [homeState, homeActions] = useHomeViewModel(books);
  const [term, setTerm] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [neighborhood, setNeighborhood] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<SearchSortOption>("recent");
  const [terms, setTerms] = useState<readonly string[]>([]);

  useEffect(() => { void history.listTerms(userId).then(setTerms); }, [userId, history]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const b of homeState.books) {
      if (b.category?.trim()) {
        set.add(b.category.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [homeState.books]);

  const filteredBooks = useMemo(
    () => sortBooks(filterBooks(homeState.books, { term, filters, neighborhood }), sortBy),
    [homeState.books, term, filters, neighborhood, sortBy],
  );

  const draftResultCount = useMemo(
    () => filterBooks(homeState.books, { term, filters: draftFilters, neighborhood }).length,
    [homeState.books, term, draftFilters, neighborhood],
  );

  const activeFilters = useMemo(() => deriveActiveFilters(filters), [filters]);

  const hasActiveFilters = useMemo(() => {
    const hasNeighborhood = neighborhood !== "all" && neighborhood !== "Todos os bairros";
    return Boolean(term.trim()) || hasNeighborhood || activeFilters.length > 0;
  }, [term, neighborhood, activeFilters]);

  const resultsSummary = useMemo(
    () => describeResults(filteredBooks.length, filters),
    [filteredBooks.length, filters],
  );

  const clearFilters = useCallback(() => {
    setTerm("");
    setFilters(DEFAULT_SEARCH_FILTERS);
    setDraftFilters(DEFAULT_SEARCH_FILTERS);
    setNeighborhood("all");
    setSortBy("recent");
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_SEARCH_FILTERS);
    setDraftFilters(DEFAULT_SEARCH_FILTERS);
    setSortBy("recent");
  }, []);

  const removeActiveFilter = useCallback((key: SearchFilterKey) => {
    setFilters((current) => removeFilter(current, key));
  }, []);

  const openFilterDraft = useCallback(() => {
    setDraftFilters(filters);
  }, [filters]);

  const updateDraftFilters = useCallback((patch: Partial<SearchFilters>) => {
    setDraftFilters((current) => ({ ...current, ...patch }));
  }, []);

  const applyDraftFilters = useCallback(() => {
    setFilters(draftFilters);
  }, [draftFilters]);

  const registerSearch = useCallback(async (value: string) => {
    setTerms(await history.registerSearch(userId, value));
  }, [userId, history]);

  const clearHistory = useCallback(async () => {
    await history.clearHistory(userId);
    setTerms([]);
  }, [userId, history]);

  return [
    {
      term,
      filters,
      draftFilters,
      modality: filters.modality,
      category: filters.category,
      condition: filters.condition,
      neighborhood,
      priceRange: filters.priceRange,
      sortBy,
      availableCategories,
      activeFilters,
      activeFilterCount: activeFilters.length,
      hasActiveFilters,
      resultsSummary,
      draftResultCount,
      books: filteredBooks,
      loading: homeState.loading,
      error: homeState.error,
      history: terms,
    },
    {
      setTerm,
      setModality: (modality) => setFilters((current) => ({ ...current, modality })),
      setCategory: (category) => setFilters((current) => ({ ...current, category })),
      setCondition: (condition) => setFilters((current) => ({ ...current, condition })),
      setNeighborhood,
      setPriceRange: (priceRange) => setFilters((current) => ({ ...current, priceRange })),
      setSortBy,
      removeActiveFilter,
      openFilterDraft,
      updateDraftFilters,
      applyDraftFilters,
      resetFilters,
      clearFilters,
      reload: homeActions.reload,
      registerSearch,
      clearHistory,
    },
  ];
}
