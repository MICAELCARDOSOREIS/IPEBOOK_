import { Platform } from "react-native";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError, EmailAlreadyRegisteredError, ExpiredLinkError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

/** Nome informado no cadastro, guardado em `user_metadata.full_name` (ver Spec 030). */
function readFullName(user: { user_metadata?: Record<string, unknown> | null }): string | undefined {
  const value = user.user_metadata?.full_name;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function translateSupabaseAuthError(error: { message?: string; status?: number; code?: string }): {
  isEmailRegistered: boolean;
  message: string;
} {
  const code = (error.code ?? "").toLowerCase();
  const msg = (error.message ?? "").toLowerCase();
  const status = error.status;

  if (
    code === "user_already_exists" ||
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already registered")
  ) {
    return {
      isEmailRegistered: true,
      message: "Este e-mail já está cadastrado. Entre com sua senha.",
    };
  }

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    msg.includes("security purposes") ||
    msg.includes("rate limit")
  ) {
    return {
      isEmailRegistered: false,
      message: "Muitas tentativas em pouco tempo. Aguarde alguns instantes antes de tentar novamente.",
    };
  }

  if (code === "weak_password" || msg.includes("password should be at least")) {
    return {
      isEmailRegistered: false,
      message: "A senha deve conter no mínimo 6 caracteres.",
    };
  }

  if (code === "signup_disabled" || msg.includes("signups not allowed")) {
    return {
      isEmailRegistered: false,
      message: "Novos cadastros estão temporariamente indisponíveis.",
    };
  }

  if (msg.includes("invalid format") || msg.includes("valid email") || msg.includes("unable to validate email")) {
    return {
      isEmailRegistered: false,
      message: "Informe um endereço de e-mail válido.",
    };
  }

  return {
    isEmailRegistered: false,
    message:
      error.message && error.message !== "interno"
        ? error.message
        : "Não foi possível criar a conta. Tente novamente.",
  };
}

export class SupabaseAuthDataSource implements IAuthDataSource {
  constructor(
    private readonly client: SupabaseAppClient,
    private readonly recoveryRedirectUrl: string,
  ) {}

  async signUp(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn("[SupabaseAuthDataSource.signUp] Erro retornado pelo Supabase:", {
          message: error.message,
          status: error.status,
          code: error.code,
        });
      }
      const translated = translateSupabaseAuthError(error);
      if (translated.isEmailRegistered) {
        throw new EmailAlreadyRegisteredError(translated.message);
      }
      throw new AuthError(translated.message);
    }
    if (!data.user?.email) {
      throw new AuthError("Não foi possível criar a conta. Tente novamente.");
    }
    /**
     * Supabase responde com sucesso (sem erro) e `identities: []` quando o e-mail já está
     * cadastrado e confirmado — nenhuma conta nova é criada nem e-mail é enviado. Sem esta
     * checagem, a pessoa via a tela como se a conta tivesse sido criada (Issue #97).
     */
    if (data.user.identities?.length === 0) {
      throw new EmailAlreadyRegisteredError("Este e-mail já está cadastrado. Entre com sua senha.");
    }
    return { id: data.user.id, email: data.user.email, name: readFullName(data.user) ?? name };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) {
      if (error) {
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.warn("[SupabaseAuthDataSource.signIn] Erro retornado pelo Supabase:", {
            message: error.message,
            status: error.status,
            code: error.code,
          });
        }
        const msg = (error.message ?? "").toLowerCase();
        if (msg.includes("email not confirmed")) {
          throw new AuthError("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
        }
        if (error.status === 429 || msg.includes("security purposes") || msg.includes("rate limit")) {
          throw new AuthError("Muitas tentativas em pouco tempo. Aguarde alguns instantes antes de tentar novamente.");
        }
      }
      throw new AuthError("Credenciais inválidas ou conta ainda não confirmada.");
    }
    return { id: data.user.id, email: data.user.email, name: readFullName(data.user) };
  }

  async signInWithGoogle(): Promise<User> {
    const authClient = this.client.auth as unknown as {
      signInWithOAuth?: (params: {
        provider: "google";
        options?: { redirectTo?: string; skipBrowserRedirect?: boolean };
      }) => Promise<{ data: { url: string | null } | null; error: Error | null }>;
    };

    if (typeof authClient.signInWithOAuth !== "function") {
      throw new AuthError("Login com Google indisponível no cliente atual.");
    }

    // Web: o navegador vai ao Google e volta para /auth/callback, que cria a sessão.
    if (Platform.OS === "web") {
      const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost:8081";
      const { data, error } = await authClient.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (error) throw new AuthError("Não foi possível autenticar com o Google. Tente novamente.");
      if (data?.url && typeof window !== "undefined") window.location.href = data.url;
      const current = await this.currentUser();
      return current ?? { id: "pending", email: "", name: "Usuário Google" };
    }

    // Nativo (Spec 085): a sessão de autenticação do expo-web-browser abre o Google e devolve a URL de
    // retorno, em vez de deixar o login terminar no Chrome (no site).
    const redirectTo = await nativeAuthRedirect();
    const { data, error } = await authClient.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      throw new AuthError("Não foi possível autenticar com o Google. Tente novamente.");
    }

    const WebBrowser = await import("expo-web-browser");
    if (Platform.OS === "android" && typeof WebBrowser.warmUpAsync === "function") {
      try {
        await WebBrowser.warmUpAsync();
      } catch {
        // Ignora se o dispositivo ou navegador padrão não suportar Custom Tabs
      }
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
      createTask: false,
    });
    if (result.type !== "success" || !("url" in result)) {
      if (typeof __DEV__ !== "undefined" && __DEV__) {
        console.warn(`[SupabaseAuthDataSource.signInWithGoogle] Sessão não concluída: ${JSON.stringify(result)} (retorno esperado: ${redirectTo})`);
      }
      throw new AuthError("Login com Google cancelado.");
    }
    return this.setSessionFromUrl(result.url);
  }

  async setSessionFromUrl(url: string): Promise<User> {
    try {
      const parsed = new URL(url);
      const query = new URLSearchParams(parsed.search);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
      const code = query.get("code");
      const accessToken = hash.get("access_token") || query.get("access_token");
      const refreshToken = hash.get("refresh_token") || query.get("refresh_token");

      if (code) {
        const { data, error } = await this.client.auth.exchangeCodeForSession(code);
        if (error || !data.user?.email) throw new AuthError("Falha ao autenticar com o código recebido.");
        return { id: data.user.id, email: data.user.email, name: readFullName(data.user) };
      }

      if (accessToken && refreshToken) {
        const { data, error } = await this.client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error || !data.user?.email) throw new AuthError("Falha ao restaurar sessão.");
        return { id: data.user.id, email: data.user.email, name: readFullName(data.user) };
      }

      throw new AuthError("URL de autenticação não contém tokens válidos.");
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Não foi possível processar o retorno de autenticação.");
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw new AuthError("Não foi possível sair. Tente novamente.");
  }

  async currentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw new AuthError("Não foi possível conferir a sessão.");
    const user = data.session?.user;
    return user?.email ? { id: user.id, email: user.email, name: readFullName(user) } : null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: this.recoveryRedirectUrl,
    });
    if (error) {
      throw new AuthError("Não foi possível solicitar a recuperação. Tente novamente.");
    }
  }

  async completePasswordReset(link: string | null, newPassword: string): Promise<void> {
    if (!link) throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
    try {
      const parsed = new URL(link);
      const query = new URLSearchParams(parsed.search);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
      const code = query.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (code) {
        const { error } = await this.client.auth.exchangeCodeForSession(code);
        if (error) throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
      } else if (accessToken && refreshToken) {
        const { error } = await this.client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
      } else {
        throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
      }
    } catch (error) {
      if (error instanceof ExpiredLinkError) throw error;
      throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
    }

    const { data: sessionData, error: sessionError } = await this.client.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new ExpiredLinkError("Link de recuperação inválido ou expirado.");
    }
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw new AuthError("Não foi possível atualizar a senha. Tente novamente.");
    await this.client.auth.signOut();
  }

  async deleteAccount(userId: string): Promise<void> {
    const { error } = await this.client.rpc("delete_user_account", { target_user_id: userId });
    if (error) {
      throw new AuthError("Não foi possível excluir a conta. Tente novamente.");
    }
    await this.client.auth.signOut();
  }
}

/**
 * Endereço de retorno do login social no nativo (Spec 085). No SDK 58, `Linking.createURL` devolvia
 * `ipebook:///auth/callback` no Expo Go deste projeto (sem `expoGoConfig.developer` nem `expoConfig.hostUri`): o
 * Expo Go não abre esse esquema e, sem host, o Supabase o recusa e manda o login para o site. A origem do bundle
 * (mesma fonte que o `createURL` usa) é o sinal confiável: servido por HTTP (Expo Go) o retorno é
 * `exp://<ip>:8081/--/auth/callback`; carregado do disco (app instalado), `ipebook://auth/callback`.
 */
async function nativeAuthRedirect(): Promise<string> {
  // `exp://` só é aberto pelo Expo Go; o APK de desenvolvimento também tem Metro, mas trata `ipebook://`.
  const { default: Constants, ExecutionEnvironment } = await import("expo-constants");
  if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) return "ipebook://auth/callback";
  const { getBundleOrigin } = await import("expo/internal/bundle-origin");
  const origin = getBundleOrigin();
  return origin ? `exp://${origin.replace(/^https?:\/\//, "")}/--/auth/callback` : "ipebook://auth/callback";
}
