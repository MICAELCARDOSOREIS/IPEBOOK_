import { useCallback, useRef, useState } from "react";
import { blockedUserUseCases, bookUseCases } from "@/di/container";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";

export type ProfileSafetyDeps = {
  blockUser: (sessionUserId: string | null, targetUserId: string) => Promise<void>;
  listBooks: () => Promise<readonly Book[]>;
};

const defaultDeps: ProfileSafetyDeps = {
  blockUser: (sessionUserId, targetUserId) => blockedUserUseCases.blockUser(sessionUserId, targetUserId),
  listBooks: () => bookUseCases.listBooks(),
};

export type ProfileSafetyState = {
  /** Anúncios da pessoa que podem ser denunciados; `null` até carregar. */
  listings: readonly Book[] | null;
  loadingListings: boolean;
  blocking: boolean;
  blocked: boolean;
  error: string | null;
};

export type ProfileSafetyActions = {
  loadListings: () => Promise<void>;
  block: () => Promise<boolean>;
  clearError: () => void;
};

/**
 * "Denunciar ou bloquear" no perfil público (Spec 091). Denúncias existem por anúncio, então a
 * denúncia parte de um anúncio da pessoa; o bloqueio vale para a pessoa toda e é desfeito em
 * Perfil > Pessoas bloqueadas.
 */
export function useProfileSafetyViewModel(
  sessionUserId: string | null,
  targetUserId: string,
  deps: ProfileSafetyDeps = defaultDeps,
): [ProfileSafetyState, ProfileSafetyActions] {
  const [state, setState] = useState<ProfileSafetyState>({
    listings: null,
    loadingListings: false,
    blocking: false,
    blocked: false,
    error: null,
  });
  const blocking = useRef(false);

  const loadListings = useCallback(async () => {
    setState((prev) => ({ ...prev, loadingListings: true, error: null }));
    try {
      const books = await deps.listBooks();
      setState((prev) => ({
        ...prev,
        loadingListings: false,
        listings: books.filter((book) => book.ownerId === targetUserId && book.status !== "draft"),
      }));
    } catch {
      setState((prev) => ({ ...prev, loadingListings: false, error: "Não foi possível carregar os anúncios desta pessoa." }));
    }
  }, [deps, targetUserId]);

  const block = useCallback(async () => {
    if (blocking.current) return false;
    blocking.current = true;
    setState((prev) => ({ ...prev, blocking: true, error: null }));
    try {
      await deps.blockUser(sessionUserId, targetUserId);
      setState((prev) => ({ ...prev, blocking: false, blocked: true }));
      return true;
    } catch (err) {
      const error = err instanceof DomainError ? err.message : "Não foi possível bloquear. Tente novamente.";
      setState((prev) => ({ ...prev, blocking: false, error }));
      return false;
    } finally {
      blocking.current = false;
    }
  }, [deps, sessionUserId, targetUserId]);

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);

  return [state, { loadListings, block, clearError }];
}
