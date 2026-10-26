import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type DraftsState = {
  drafts: readonly Book[];
  loading: boolean;
  error: string | null;
  discardingId: string | null;
  discardError: string | null;
};

export type DraftsActions = {
  reload: () => Promise<void>;
  discardDraft: (bookId: string) => Promise<boolean>;
};

/**
 * Lista de rascunhos do usuário (Spec 017, telas Figma `04.11`–`04.16`). Carrega os
 * anúncios com status `draft`, permite descartar (com confirmação tratada na View) e
 * expõe o estado vazio para a tela não-autenticada ou sem rascunhos.
 */
export function useDraftsViewModel(
  sessionUserId: string | null,
  useCases: IBookUseCases = bookUseCases,
): [DraftsState, DraftsActions] {
  const [state, setState] = useState<DraftsState>({
    drafts: [],
    loading: true,
    error: null,
    discardingId: null,
    discardError: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null, discardError: null }));
    try {
      const result = await useCases.listDrafts(sessionUserId);
      if (active.current && current === request.current) {
        setState((previous) => ({ ...previous, drafts: result, loading: false, error: null }));
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            error instanceof DomainError
              ? error.message
              : "Não foi possível carregar seus rascunhos. Tente novamente.",
        }));
      }
    }
  }, [useCases, sessionUserId]);

  const discardDraft = useCallback(
    async (bookId: string): Promise<boolean> => {
      setState((previous) => ({ ...previous, discardingId: bookId, discardError: null }));
      try {
        await useCases.discardDraft(bookId, sessionUserId);
        setState((previous) => ({
          ...previous,
          discardingId: null,
          drafts: previous.drafts.filter((draft) => draft.id !== bookId),
        }));
        return true;
      } catch (error) {
        setState((previous) => ({
          ...previous,
          discardingId: null,
          discardError:
            error instanceof DomainError
              ? error.message
              : "Não foi possível descartar o rascunho. Tente novamente.",
        }));
        return false;
      }
    },
    [useCases, sessionUserId],
  );

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload, discardDraft }];
}
