import { useMemo, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

export type SearchState = {
  term: string;
  books: readonly Book[];
  loading: boolean;
  error: string | null;
};

export type SearchActions = {
  setTerm: (term: string) => void;
  reload: () => Promise<void>;
};

function matches(book: Book, normalizedTerm: string): boolean {
  return (
    book.title.toLowerCase().includes(normalizedTerm) ||
    book.author.toLowerCase().includes(normalizedTerm)
  );
}

/** Busca client-side (FR-005): filtra o catálogo já carregado, sem chamar listBooks() por tecla. */
export function useSearchViewModel(
  books: IBookUseCases = bookUseCases,
): [SearchState, SearchActions] {
  const [homeState, homeActions] = useHomeViewModel(books);
  const [term, setTerm] = useState("");

  const filteredBooks = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) return homeState.books;
    return homeState.books.filter((book) => matches(book, normalizedTerm));
  }, [homeState.books, term]);

  return [
    { term, books: filteredBooks, loading: homeState.loading, error: homeState.error },
    { setTerm, reload: homeActions.reload },
  ];
}
