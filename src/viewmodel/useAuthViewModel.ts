import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  signInWithGoogle?: () => Promise<boolean>;
  handleAuthCallback?: (url: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  /** Relê a sessão gravada no aparelho, sem recarregar a tela. */
  refreshSession?: () => Promise<void>;
};

const GENERIC_ERROR = "Não foi possível concluir. Tente novamente.";

let sessionAuthCache: { resolved: boolean; user: User | null } = {
  resolved: false,
  user: null,
};

export function useAuthViewModel(
  auth: IAuthUseCases,
  rateLimiter: IRateLimiter,
  logger: ILogger,
): [AuthState, AuthActions] {
  const isTest = process.env.NODE_ENV === "test";
  const hasCachedSession = !isTest && sessionAuthCache.resolved;
  const [state, setState] = useState<AuthState>({
    user: hasCachedSession ? sessionAuthCache.user : null,
    loading: !hasCachedSession,
    error: null,
  });
  const active = useRef(false);

  useEffect(() => {
    active.current = true;
    void (async () => {
      try {
        const timeoutPromise = isTest
          ? null
          : new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
        const user = timeoutPromise
          ? await Promise.race([auth.getSession(), timeoutPromise])
          : await auth.getSession();
        if (!isTest) sessionAuthCache = { resolved: true, user };
        if (active.current) setState({ user, loading: false, error: null });
      } catch {
        if (!isTest) sessionAuthCache = { resolved: true, user: null };
        if (active.current) setState({ user: null, loading: false, error: null });
      }
    })();
    return () => {
      active.current = false;
    };
  }, [auth, isTest]);

  const run = useCallback(async (action: () => Promise<User>) => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const user = await action();
      if (!isTest) sessionAuthCache = { resolved: true, user };
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
  }, [isTest]);

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
      if (!isTest) sessionAuthCache = { resolved: true, user };
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
  }, [auth, rateLimiter, logger, isTest]);

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
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setState((previous) => ({
        ...previous,
        loading: false,
        error: "Informe o e-mail da sua conta.",
      }));
      return false;
    }
    const guard = guardFormSubmit(rateLimiter, formKey("auth:resetRequest", normalizedEmail), 3);
    if (!guard.allowed) {
      logger.warn("Pedido de recuperação bloqueado pelo limite de tentativas do cliente");
      setState((previous) => ({ ...previous, loading: false, error: guard.message }));
      return false;
    }
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      await auth.requestPasswordReset(normalizedEmail);
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

  const signInWithGoogle = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null, statusMessage: null }));
    try {
      if (!auth.signInWithGoogle) {
        throw new DomainError("Login com Google indisponível.");
      }
      const user = await auth.signInWithGoogle();
      if (!isTest) sessionAuthCache = { resolved: true, user };
      if (active.current) {
        setState({ user, loading: false, error: null, statusMessage: null });
      }
      return Boolean(user && user.id && user.id !== "pending");
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          statusMessage: null,
        }));
      }
      if (error instanceof DomainError && error.message.toLowerCase().includes("cancelado")) {
        logger.info("Login com Google cancelado pelo usuário");
      } else {
        logger.error("Falha ao autenticar com Google", error);
      }
      return false;
    }
  }, [auth, logger, isTest]);

  const handleAuthCallback = useCallback(async (url: string) => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      if (!auth.setSessionFromUrl) {
        throw new DomainError("Processamento de retorno de autenticação indisponível.");
      }
      const user = await auth.setSessionFromUrl(url);
      if (!isTest) sessionAuthCache = { resolved: true, user };
      if (active.current) {
        setState({ user, loading: false, error: null, statusMessage: null });
      }
      return Boolean(user && user.id && user.id !== "pending");
    } catch (error) {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          statusMessage: null,
        }));
      }
      logger.error("Falha ao processar callback de autenticação", error);
      return false;
    }
  }, [auth, logger, isTest]);

  const signOut = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      await auth.signOut();
      if (!isTest) sessionAuthCache = { resolved: true, user: null };
      if (active.current) setState({ user: null, loading: false, error: null });
      return true;
    } catch {
      if (active.current) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: "Não foi possível sair da conta. Tente novamente.",
        }));
      }
      return false;
    }
  }, [auth, isTest]);

  // Cada tela tem seu próprio estado de sessão: quem sobe o app antes do login precisa reler a sessão
  // para que o aviso de permissão apareça na mesma execução (Spec 020 T005).
  const refreshSession = useCallback(async () => {
    try {
      const user = await auth.getSession();
      if (!isTest) sessionAuthCache = { resolved: true, user };
      if (!active.current) return;
      setState((previous) => (previous.user?.id === user?.id ? previous : { ...previous, user, loading: false, error: null }));
    } catch {
      /* sem sessão lida: mantém o estado, o app continua funcionando */
    }
  }, [auth, isTest]);

  const actions = useMemo<AuthActions>(
    () => ({ signUp, signIn, signInWithGoogle, handleAuthCallback, signOut, requestPasswordReset, refreshSession }),
    [signUp, signIn, signInWithGoogle, handleAuthCallback, signOut, requestPasswordReset, refreshSession],
  );

  return [state, actions];
}
