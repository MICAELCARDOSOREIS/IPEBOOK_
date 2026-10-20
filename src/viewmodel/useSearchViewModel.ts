import { useCallback, useEffect, useMemo, useState } from "react";
import { bookUseCases, searchHistoryUseCases } from "@/di/container";
import type { Book, BookModality } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

export type SearchModalityFilter = BookModality | "all";
export type SearchSortOption = "recent" | "title";

export type SearchState = {
  term: string;
  modality: SearchModalityFilter;
  sortBy: SearchSortOption;
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  history: readonly string[];
};

export type SearchActions = {
  setTerm: (term: string) => void;
  setModality: (modality: SearchModalityFilter) => void;
  setSortBy: (sortBy: SearchSortOption) => void;
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

/** Busca client-side (FR-005, Issue #93): filtra e ordena o catálogo já carregado. */
export function useSearchViewModel(
  userId: string | null = null,
  books: IBookUseCases = bookUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [SearchState, SearchActions] {
  const [homeState, homeActions] = useHomeViewModel(books);
  const [term, setTerm] = useState("");
  const [modality, setModality] = useState<SearchModalityFilter>("all");
  const [sortBy, setSortBy] = useState<SearchSortOption>("recent");
  const [terms, setTerms] = useState<readonly string[]>([]);

  useEffect(() => { void history.listTerms(userId).then(setTerms); }, [userId, history]);

  const filteredBooks = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    let result = homeState.books;
    if (normalizedTerm) {
      result = result.filter((book) => matches(book, normalizedTerm));
    }
    if (modality !== "all") {
      result = result.filter((book) => book.modality === modality);
    }
    if (sortBy === "title") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    }
    return result;
  }, [homeState.books, term, modality, sortBy]);

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
      sortBy,
      books: filteredBooks,
      loading: homeState.loading,
      error: homeState.error,
      history: terms,
    },
    {
      setTerm,
      setModality,
      setSortBy,
      reload: homeActions.reload,
      registerSearch,
      clearHistory,
    },
  ];
}
