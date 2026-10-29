import { useCallback, useEffect, useRef, useState } from "react";
import { publicProfileUseCases } from "@/di/container";
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
};

const GENERIC_ERROR = "Não foi possível carregar o perfil. Tente novamente.";
const GENERIC_SAVE_ERROR = "Não foi possível salvar o perfil. Tente novamente.";

export function useProfileViewModel(
  userId: string | null,
  useCases: IPublicProfileUseCases = publicProfileUseCases,
): [ProfileState, ProfileActions] {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
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
    setState((previous) => ({ ...previous, loading: true, error: null }));
    void (async () => {
      try {
        const profile = await useCases.getPublicProfile(userId);
        if (active.current) setState({ profile, loading: false, saving: false, error: null });
      } catch (error) {
        if (active.current) {
          setState({
            profile: null,
            loading: false,
            saving: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    })();
  }, [userId, useCases]);

  const update = useCallback(
    async (edits: ProfileEdits) => {
      if (!userId) return false;
      setState((previous) => ({ ...previous, saving: true, error: null }));
      try {
        const profile = await useCases.updateProfile(userId, edits);
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
    [userId, useCases],
  );

  return [state, { update }];
}
