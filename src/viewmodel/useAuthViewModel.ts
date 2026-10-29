import { useCallback, useEffect, useRef, useState } from "react";
import { authUseCases, logger as defaultLogger, rateLimiter as defaultRateLimiter } from "@/di/container";
import type { User } from "@/model/entities/user";
import { DomainError } from "@/model/errors";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import { formKey, guardFormSubmit } from "@/viewmodel/formRateLimit";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  statusMessage?: string | null;
};

export type AuthActions = {
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
};

const GENERIC_ERROR = "Não foi possível concluir. Tente novamente.";

export function useAuthViewModel(
  auth: IAuthUseCases = authUseCases,
  rateLimiter: IRateLimiter = defaultRateLimiter,
  logger: ILogger = defaultLogger,
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

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const guard = guardFormSubmit(rateLimiter, formKey("auth:signUp", email));
    if (!guard.allowed) {
      logger.warn("Cadastro bloqueado pelo limite de tentativas do cliente");
      setState((previous) => ({ ...previous, loading: false, error: guard.message, statusMessage: null }));
      return false;
    }
    setState((previous) => ({ ...previous, loading: true, error: null, statusMessage: null }));
    try {
      await auth.signUp(email, password, name);
      const user = await auth.getSession();
      if (active.current) setState({
        user,
        loading: false,
        error: null,
        statusMessage: user ? null : "Conta criada. Confirme seu e-mail antes de entrar.",
      });
      return Boolean(user);
    } catch (error) {
      if (active.current) setState((previous) => ({
        ...previous,
        loading: false,
        error: error instanceof DomainError ? error.message : GENERIC_ERROR,
      }));
      logger.error("Falha ao criar conta", error);
      return false;
    }
  }, [auth, rateLimiter, logger]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const key = formKey("auth:signIn", email);
      const guard = guardFormSubmit(rateLimiter, key);
      if (!guard.allowed) {
        logger.warn("Entrada bloqueada pelo limite de tentativas do cliente");
        setState((previous) => ({ ...previous, loading: false, error: guard.message }));
        return false;
      }
      const ok = await run(() => auth.signIn(email, password));
      if (ok) {
        rateLimiter.reset(key);
      } else {
        logger.warn("Tentativa de entrada recusada");
      }
      return ok;
    },
    [auth, run, rateLimiter, logger],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const guard = guardFormSubmit(rateLimiter, formKey("auth:resetRequest", email), 3);
    if (!guard.allowed) {
      logger.warn("Pedido de recuperação bloqueado pelo limite de tentativas do cliente");
      setState((previous) => ({ ...previous, loading: false, error: guard.message }));
      return false;
    }
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      await auth.requestPasswordReset(email);
      if (active.current) setState((previous) => ({ ...previous, loading: false, error: null }));
      return true;
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
      logger.error("Falha ao solicitar recuperação de senha", error);
      return false;
    }
  }, [auth, rateLimiter, logger]);

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
