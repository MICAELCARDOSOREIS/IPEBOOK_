import { useCallback, useState } from "react";
import { authUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";

export type ResetPasswordState = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type ResetPasswordActions = {
  submit: (link: string | null, password: string) => Promise<void>;
};

export function useResetPasswordViewModel(
  auth: IAuthUseCases = authUseCases,
): [ResetPasswordState, ResetPasswordActions] {
  const [state, setState] = useState<ResetPasswordState>({ loading: false, error: null, success: false });
  const submit = useCallback(async (link: string | null, password: string) => {
    setState({ loading: true, error: null, success: false });
    try {
      await auth.completePasswordReset(link, password);
      setState({ loading: false, error: null, success: true });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof DomainError ? error.message : "Não foi possível atualizar a senha.",
        success: false,
      });
    }
  }, [auth]);
  return [state, { submit }];
}
