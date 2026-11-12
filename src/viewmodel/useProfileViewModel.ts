import { useCallback, useEffect, useRef, useState } from "react";
import type { ProfileEdits, PublicProfile } from "@/model/entities/publicProfile";
import { DomainError } from "@/model/errors";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";

export type ProfileState = {
  profile: PublicProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

export type ProfileActions = {
  update: (edits: ProfileEdits) => Promise<boolean>;
  /** Recarrega o perfil e as mensagens de erro atuais (usado pelo estado de erro da tela). */
  reload: () => void;
};

const GENERIC_ERROR = "Não foi possível carregar o perfil. Tente novamente.";
const GENERIC_SAVE_ERROR = "Não foi possível salvar o perfil. Tente novamente.";

const sessionProfileCache = new Map<string, PublicProfile>();

export function useProfileViewModel(
  userId: string | null,
  useCases: IPublicProfileUseCases,
): [ProfileState, ProfileActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialCached = !isTest && userId ? (sessionProfileCache.get(userId) ?? null) : null;
  const [state, setState] = useState<ProfileState>({
    profile: initialCached,
    loading: initialCached === null,
    saving: false,
    error: null,
  });
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setState({ profile: null, loading: false, saving: false, error: null });
      return;
    }
    const cached = !isTest ? (sessionProfileCache.get(userId) ?? null) : null;
    setState((previous) => ({
      ...previous,
      profile: previous.profile ?? cached,
      loading: (previous.profile ?? cached) === null,
      error: null,
    }));
    void (async () => {
      try {
        const profile = await useCases.getPublicProfile(userId);
        if (!isTest) sessionProfileCache.set(userId, profile);
        if (active.current) setState({ profile, loading: false, saving: false, error: null });
      } catch (error) {
        if (active.current) {
          setState((previous) => ({
            profile: previous.profile,
            loading: false,
            saving: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          }));
        }
      }
    })();
  }, [userId, useCases, isTest]);

  const update = useCallback(
    async (edits: ProfileEdits) => {
      if (!userId) return false;
      setState((previous) => ({ ...previous, saving: true, error: null }));
      try {
        const profile = await useCases.updateProfile(userId, edits);
        if (!isTest) sessionProfileCache.set(userId, profile);
        if (active.current) setState({ profile, loading: false, saving: false, error: null });
        return true;
      } catch (error) {
        if (active.current) {
          setState((previous) => ({
            ...previous,
            saving: false,
            error: error instanceof DomainError ? error.message : GENERIC_SAVE_ERROR,
          }));
        }
        return false;
      }
    },
    [userId, useCases, isTest],
  );

  const reload = useCallback(() => {
    if (!userId) return;
    setState((previous) => ({ ...previous, loading: previous.profile === null, error: null }));
    void (async () => {
      try {
        const profile = await useCases.getPublicProfile(userId);
        if (!isTest) sessionProfileCache.set(userId, profile);
        if (active.current) setState({ profile, loading: false, saving: false, error: null });
      } catch (error) {
        if (active.current) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          }));
        }
      }
    })();
  }, [userId, useCases, isTest]);

  return [state, { update, reload }];
}
