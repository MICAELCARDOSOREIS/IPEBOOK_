import { useCallback, useEffect, useRef, useState } from "react";
import { publicProfileUseCases } from "@/di/container";
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

export function usePublicProfileViewModel(
  userId: string,
  useCases: IPublicProfileUseCases = publicProfileUseCases,
): [PublicProfileState, PublicProfileActions] {
  const [state, setState] = useState<PublicProfileState>({
    profile: null,
    loading: true,
    error: null,
  });
  const active = useRef(false);
  const request = useRef(0);

  const reload = useCallback(async () => {
    if (!active.current) return;
    const current = ++request.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const profile = await useCases.getPublicProfile(userId);
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
  }, [useCases, userId]);

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
