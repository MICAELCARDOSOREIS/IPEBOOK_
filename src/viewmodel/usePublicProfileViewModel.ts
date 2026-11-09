import { useCallback, useEffect, useRef, useState } from "react";
import { DomainError } from "@/model/errors";
import type { PublicProfile } from "@/model/entities/publicProfile";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";

export type PublicProfileState = {
  profile: PublicProfile | null;
  loading: boolean;
  error: string | null;
};

export type PublicProfileActions = {
  reload: () => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível carregar o perfil. Tente novamente.";
const sessionPublicProfileCache = new Map<string, PublicProfile>();

export function usePublicProfileViewModel(
  userId: string,
  useCases: IPublicProfileUseCases,
): [PublicProfileState, PublicProfileActions] {
  const isTest = process.env.NODE_ENV === "test";
  const initialProfile = !isTest ? (sessionPublicProfileCache.get(userId) ?? null) : null;
  const [state, setState] = useState<PublicProfileState>({
    profile: initialProfile,
    loading: initialProfile === null,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: previous.profile === null, error: null }));
    try {
      const profile = await useCases.getPublicProfile(userId);
      if (!isTest) sessionPublicProfileCache.set(userId, profile);
      if (active.current && current === request.current) {
        setState({ profile, loading: false, error: null });
      }
    } catch (error) {
      if (active.current && current === request.current) {
        setState({
          profile: null,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        });
      }
    }
  }, [useCases, userId, isTest]);

  useEffect(() => {
    active.current = true;
    void reload();
    return () => {
      active.current = false;
      request.current += 1;
    };
  }, [reload]);

  return [state, { reload }];
}
