import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type ManageListingState = {
  book: Book | null;
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
  useCases: IBookUseCases = bookUseCases,
): [ManageListingState, ManageListingActions] {
  const [state, setState] = useState<ManageListingState>({
    book: null,
    loading: true,
    busy: false,
    error: null,
    removed: false,
  });
  const active = useRef(false);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
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
      if (active.current) {
        setState({ book, loading: false, busy: false, error: null, removed: false });
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
  }, [bookId, sessionUserId, useCases]);

  const togglePause = useCallback(async () => {
    setState((prev) => ({ ...prev, busy: true, error: null }));
    try {
      const updated = await useCases.togglePauseListing(bookId, sessionUserId);
      if (active.current) setState((prev) => ({ ...prev, book: updated, busy: false }));
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
  }, [bookId, sessionUserId, useCases]);

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
  }, [bookId, sessionUserId, useCases]);

  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [load]);

  return [state, { load, togglePause, remove }];
}
