import { useCallback, useEffect, useRef, useState } from "react";
import { userPreferencesUseCases } from "@/di/container";
import type { UserPreferences, UserPreferencesEdits } from "@/model/entities/userPreferences";
import { DomainError } from "@/model/errors";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";

export type UserPreferencesState = {
  preferences: UserPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

export type UserPreferencesActions = {
  update: (edits: UserPreferencesEdits) => Promise<boolean>;
};

const GENERIC_ERROR = "Não foi possível carregar suas preferências. Tente novamente.";
const GENERIC_SAVE_ERROR = "Não foi possível salvar suas preferências. Tente novamente.";

export function useUserPreferencesViewModel(
  userId: string | null,
  useCases: IUserPreferencesUseCases = userPreferencesUseCases,
): [UserPreferencesState, UserPreferencesActions] {
  const [state, setState] = useState<UserPreferencesState>({
    preferences: null,
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
      setState({ preferences: null, loading: false, saving: false, error: null });
      return;
    }
    setState((previous) => ({ ...previous, loading: true, error: null }));
    void (async () => {
      try {
        const preferences = await useCases.getPreferences(userId);
        if (active.current) setState({ preferences, loading: false, saving: false, error: null });
      } catch (error) {
        if (active.current) {
          setState({
            preferences: null,
            loading: false,
            saving: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    })();
  }, [userId, useCases]);

  const update = useCallback(
    async (edits: UserPreferencesEdits) => {
      if (!userId) return false;
      setState((previous) => ({ ...previous, saving: true, error: null }));
      try {
        const preferences = await useCases.updatePreferences(userId, edits);
        if (active.current) setState({ preferences, loading: false, saving: false, error: null });
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
