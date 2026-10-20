import { useCallback, useEffect, useMemo, useState } from "react";
import { bookUseCases, searchHistoryUseCases } from "@/di/container";
import type { Book, BookModality } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

export type SearchModalityFilter = BookModality | "all";
export type SearchPriceRange = "all" | "free" | "under20" | "under50";
export type SearchSortOption = "recent" | "title" | "price_asc" | "price_desc";

export type SearchState = {
  term: string;
  modality: SearchModalityFilter;
  category: string | "all";
  priceRange: SearchPriceRange;
  sortBy: SearchSortOption;
  availableCategories: readonly string[];
  hasActiveFilters: boolean;
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  history: readonly string[];
};

export type SearchActions = {
  setTerm: (term: string) => void;
  setModality: (modality: SearchModalityFilter) => void;
  setCategory: (category: string | "all") => void;
  setPriceRange: (range: SearchPriceRange) => void;
  setSortBy: (sortBy: SearchSortOption) => void;
  clearFilters: () => void;
  reload: () => Promise<void>;
  registerSearch: (term: string) => Promise<void>;
  clearHistory: () => Promise<void>;
};

function matches(book: Book, normalizedTerm: string): boolean {
  return (
    book.title.toLowerCase().includes(normalizedTerm) ||
    book.author.toLowerCase().includes(normalizedTerm) ||
    (book.category?.toLowerCase().includes(normalizedTerm) ?? false)
  );
}

function matchesPrice(book: Book, range: SearchPriceRange): boolean {
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

/** Busca client-side (FR-005, Spec 028, Issue #93): filtra e ordena o catálogo por termo, modalidade, categoria e preço. */
export function useSearchViewModel(
  userId: string | null = null,
  books: IBookUseCases = bookUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [SearchState, SearchActions] {
  const [homeState, homeActions] = useHomeViewModel(books);
  const [term, setTerm] = useState("");
  const [modality, setModality] = useState<SearchModalityFilter>("all");
  const [category, setCategory] = useState<string | "all">("all");
  const [priceRange, setPriceRange] = useState<SearchPriceRange>("all");
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

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(term.trim()) ||
      modality !== "all" ||
      category !== "all" ||
      priceRange !== "all" ||
      sortBy !== "recent"
    );
  }, [term, modality, category, priceRange, sortBy]);

  const clearFilters = useCallback(() => {
    setTerm("");
    setModality("all");
    setCategory("all");
    setPriceRange("all");
    setSortBy("recent");
  }, []);

  const filteredBooks = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    let result = homeState.books;

    if (normalizedTerm) {
      result = result.filter((book) => matches(book, normalizedTerm));
    }
    if (modality !== "all") {
      result = result.filter((book) => book.modality === modality);
    }
    if (category !== "all") {
      const normalizedCat = category.trim().toLowerCase();
      result = result.filter((book) => book.category?.trim().toLowerCase() === normalizedCat);
    }
    if (priceRange !== "all") {
      result = result.filter((book) => matchesPrice(book, priceRange));
    }

    if (sortBy === "title") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    } else if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return result;
  }, [homeState.books, term, modality, category, priceRange, sortBy]);

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
      modality,
      category,
      priceRange,
      sortBy,
      availableCategories,
      hasActiveFilters,
      books: filteredBooks,
      loading: homeState.loading,
      error: homeState.error,
      history: terms,
    },
    {
      setTerm,
      setModality,
      setCategory,
      setPriceRange,
      setSortBy,
      clearFilters,
      reload: homeActions.reload,
      registerSearch,
      clearHistory,
    },
  ];
}
