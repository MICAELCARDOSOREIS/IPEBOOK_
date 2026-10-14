import { useCallback, useEffect, useRef, useState } from "react";
import { authUseCases } from "@/di/container";
import type { User } from "@/model/entities/user";
import { DomainError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export type AuthActions = {
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
};

const GENERIC_ERROR = "Não foi possível concluir. Tente novamente.";

export function useAuthViewModel(
  auth: IAuthUseCases = authUseCases,
): [AuthState, AuthActions] {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const active = useRef(false);

  useEffect(() => {
    active.current = true;
    void (async () => {
      try {
        const user = await auth.getSession();
        if (active.current) setState({ user, loading: false, error: null });
      } catch {
        if (active.current) setState({ user: null, loading: false, error: null });
      }
    })();
    return () => {
      active.current = false;
    };
  }, [auth]);

  const run = useCallback(async (action: () => Promise<User>) => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const user = await action();
      if (active.current) setState({ user, loading: false, error: null });
      return true;
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
      return false;
    }
  }, []);

  const signUp = useCallback(
    (email: string, password: string) => run(() => auth.signUp(email, password)),
    [auth, run],
  );

  const signIn = useCallback(
    (email: string, password: string) => run(() => auth.signIn(email, password)),
    [auth, run],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const temporaryPassword = await auth.requestPasswordReset(email);
      if (active.current) setState((previous) => ({ ...previous, loading: false, error: null }));
      return temporaryPassword;
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
      return null;
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      await auth.signOut();
      if (active.current) setState({ user: null, loading: false, error: null });
    } catch {
      if (active.current) setState((previous) => ({ ...previous, loading: false }));
    }
  }, [auth]);

  return [state, { signUp, signIn, signOut, requestPasswordReset }];
}
