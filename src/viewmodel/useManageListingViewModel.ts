import { useCallback, useEffect, useRef, useState } from "react";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";
import { getCachedCatalogBookById } from "@/viewmodel/useHomeViewModel";
import { getCachedMyListingById } from "@/viewmodel/useMyListingsViewModel";

export type ManageListingState = {
  book: Book | null;
  acceptedRequestId?: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  removed: boolean;
};

export type ManageListingActions = {
  load: () => Promise<void>;
  togglePause: () => Promise<boolean>;
  remove: () => Promise<boolean>;
};

const LOAD_ERROR = "Não foi possível carregar o anúncio.";
const ACTION_ERROR = "Não foi possível concluir a ação. Tente novamente.";

/** Estado da tela de gerenciamento de um anúncio (Figma `04.08 · Gerenciar anúncio`). */
export function useManageListingViewModel(
  bookId: string,
  sessionUserId: string | null,
  useCases: IBookUseCases,
  requestUseCases?: Pick<IBookRequestUseCases, "listReceivedRequests">,
): [ManageListingState, ManageListingActions] {
  const isTest = process.env.NODE_ENV === "test";
  const cachedBook = !isTest
    ? (getCachedMyListingById(bookId, sessionUserId) ?? getCachedCatalogBookById(bookId))
    : null;
  const initialBook =
    cachedBook && (!sessionUserId || cachedBook.ownerId === sessionUserId) ? cachedBook : null;
  const [state, setState] = useState<ManageListingState>({
    book: initialBook,
    loading: initialBook === null,
    busy: false,
    error: null,
    removed: false,
  });
  const active = useRef(false);
  const bookRef = useRef<Book | null>(state.book);
  bookRef.current = state.book;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: prev.book === null, error: null }));
    try {
      const book = await useCases.getBookById(bookId);
      if (sessionUserId && book.ownerId !== sessionUserId) {
        if (active.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Você só pode gerenciar seus próprios anúncios.",
          }));
        }
        return;
      }
      let acceptedRequestId: string | null = null;
      if (book.status === "reserved" && requestUseCases && sessionUserId) {
        try {
          const received = await requestUseCases.listReceivedRequests(sessionUserId);
          acceptedRequestId =
            received.find(
              (item) => item.request.listingId === bookId && item.request.status === "accepted",
            )?.request.id ?? null;
        } catch {
          acceptedRequestId = null;
        }
      }
      if (active.current) {
        setState({ book, acceptedRequestId, loading: false, busy: false, error: null, removed: false });
      }
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof DomainError ? error.message : LOAD_ERROR,
        }));
      }
    }
  }, [bookId, sessionUserId, useCases, requestUseCases]);

  const togglePause = useCallback(async () => {
    const previousBook = bookRef.current;
    const optimisticBook =
      previousBook && (previousBook.status === "available" || previousBook.status === "paused")
        ? {
            ...previousBook,
            status: (previousBook.status === "paused" ? "available" : "paused") as Book["status"],
          }
        : previousBook;
    setState((prev) => ({ ...prev, book: optimisticBook, busy: true, error: null }));
    try {
      const updated = await useCases.togglePauseListing(bookId, sessionUserId);
      if (active.current) setState((prev) => ({ ...prev, book: updated, busy: false }));
      return true;
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          book: previousBook,
          busy: false,
          error: error instanceof DomainError ? error.message : ACTION_ERROR,
        }));
      }
      return false;
    }
  }, [bookId, sessionUserId, useCases, requestUseCases]);

  const remove = useCallback(async () => {
    setState((prev) => ({ ...prev, busy: true, error: null }));
    try {
      await useCases.cancelListing(bookId, sessionUserId);
      if (active.current) setState((prev) => ({ ...prev, busy: false, removed: true }));
      return true;
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          busy: false,
          error: error instanceof DomainError ? error.message : ACTION_ERROR,
        }));
      }
      return false;
    }
  }, [bookId, sessionUserId, useCases, requestUseCases]);

  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [load]);

  return [state, { load, togglePause, remove }];
}
