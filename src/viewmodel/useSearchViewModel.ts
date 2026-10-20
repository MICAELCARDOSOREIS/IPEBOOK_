import { useCallback, useEffect, useMemo, useState } from "react";
import { bookUseCases, searchHistoryUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

export type SearchState = {
  term: string;
  books: readonly Book[];
  loading: boolean;
  error: string | null;
  history: readonly string[];
};

export type SearchActions = {
  setTerm: (term: string) => void;
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

/** Busca client-side (FR-005): filtra o catálogo já carregado, sem chamar listBooks() por tecla. */
export function useSearchViewModel(
  userId: string | null = null,
  books: IBookUseCases = bookUseCases,
  history: ISearchHistoryUseCases = searchHistoryUseCases,
): [SearchState, SearchActions] {
  const [homeState, homeActions] = useHomeViewModel(books);
  const [term, setTerm] = useState("");
  const [terms, setTerms] = useState<readonly string[]>([]);

  useEffect(() => { void history.listTerms(userId).then(setTerms); }, [userId, history]);

  const filteredBooks = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) return homeState.books;
    return homeState.books.filter((book) => matches(book, normalizedTerm));
  }, [homeState.books, term]);

  const registerSearch = useCallback(async (value: string) => {
    setTerms(await history.registerSearch(userId, value));
  }, [userId, history]);

  const clearHistory = useCallback(async () => {
    await history.clearHistory(userId);
    setTerms([]);
  }, [userId, history]);

  return [
    { term, books: filteredBooks, loading: homeState.loading, error: homeState.error, history: terms },
    { setTerm, reload: homeActions.reload, registerSearch, clearHistory },
  ];
}
