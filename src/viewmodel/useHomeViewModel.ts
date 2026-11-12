import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type HomeState = {
  books: readonly Book[];
  loading: boolean;
  error: string | null;
};

export type HomeActions = {
  reload: () => Promise<void>;
};

let sessionBooksCache: readonly Book[] | null = null;
let lastSessionBooksLoadAt = 0;
const CATALOG_CACHE_TTL_MS = 60_000; // 1 minuto de frescor para navegação instantânea entre abas

export function getCachedCatalogBookById(bookId: string): Book | null {
  if (process.env.NODE_ENV === "test" || !sessionBooksCache) return null;
  return sessionBooksCache.find((b) => b.id === bookId) ?? null;
}

export function useHomeViewModel(books: IBookUseCases): [HomeState, HomeActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialBooks = !isTest && sessionBooksCache ? sessionBooksCache : [];
  const [state, setState] = useState<HomeState>({
    books: initialBooks,
    loading: initialBooks.length === 0,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: previous.books.length === 0, error: null }));
    try {
      const result = await books.listBooks();
      if (!isTest) {
        sessionBooksCache = result;
        lastSessionBooksLoadAt = Date.now();
      }
      if (active.current && current === request.current) {
        setState({ books: result, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof DomainError
              ? error.message
              : "Não foi possível carregar os livros. Tente novamente.",
        }));
      }
    }
  }, [books, isTest]);

  useEffect(() => {
    active.current = true;
    const now = Date.now();
    // Se o catálogo já está em cache e foi carregado há menos de 1 minuto, não refaz requisição na montagem
    if (!isTest && sessionBooksCache && sessionBooksCache.length > 0 && now - lastSessionBooksLoadAt < CATALOG_CACHE_TTL_MS) {
      return () => {
        active.current = false;
        request.current += 1;
      };
    }
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload, isTest]);

  return [state, { reload }];
}
