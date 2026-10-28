import { useCallback, useState } from "react";
import { betaSignupUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IBetaSignupUseCases } from "@/usecase/iBetaSignupUseCases";

export type BetaSignupState = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type BetaSignupActions = {
  submit: (email: string, name: string) => Promise<void>;
  reset: () => void;
};

export function useBetaSignupViewModel(
  useCases: IBetaSignupUseCases = betaSignupUseCases,
): [BetaSignupState, BetaSignupActions] {
  const [state, setState] = useState<BetaSignupState>({ loading: false, error: null, success: false });

  const submit = useCallback(async (email: string, name: string) => {
    setState({ loading: true, error: null, success: false });
    try {
      await useCases.register({ email, name });
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof DomainError ? error.message : "Não foi possível registrar sua inscrição. Tente de novo.",
        success: false,
      });
    }
  }, [useCases]);

  const reset = useCallback(() => setState({ loading: false, error: null, success: false }), []);

  return [state, { submit, reset }];
}
