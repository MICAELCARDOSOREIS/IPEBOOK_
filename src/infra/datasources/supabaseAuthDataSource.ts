import { BUCKET_NAME } from "@/infra/datasources/supabasePhotoStorageDataSource";
import { Platform } from "react-native";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError, EmailAlreadyRegisteredError, ExpiredLinkError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { INativeGoogleSignIn } from "@/model/services/iNativeGoogleSignIn";

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
    private readonly nativeGoogle?: INativeGoogleSignIn,
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
    // Nativo com cliente configurado (Spec 106): seletor de contas do Android, sem navegador.
    if (Platform.OS !== "web" && this.nativeGoogle?.isAvailable()) {
      try {
        return await this.signInWithNativeGoogle(this.nativeGoogle);
      } catch (error) {
        // Se o Google Play Services não estiver disponível (ex.: Waydroid, AOSP ou aparelhos sem GMS),
        // faz o fallback suave para o OAuth via navegador em vez de bloquear o login.
        const isPlayServicesUnavailable =
          error instanceof AuthError && error.message.includes("Google Play Services");
        if (!isPlayServicesUnavailable) {
          throw error;
        }
      }
    }

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

  private async signInWithNativeGoogle(nativeGoogle: INativeGoogleSignIn): Promise<User> {
    const idToken = await nativeGoogle.getIdToken();
    if (!idToken) throw new AuthError("Login com Google cancelado.");
    const { data, error } = await this.client.auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error || !data.user) {
      throw new AuthError("Não foi possível autenticar com o Google. Tente novamente.");
    }
    return { id: data.user.id, email: data.user.email ?? "", name: readFullName(data.user) };
  }

  async setSessionFromUrl(url: string): Promise<User> {
    try {
      const parsed = new URL(url);
      const query = new URLSearchParams(parsed.search);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
      const code = query.get("code");
      // Tokens crus só no fragmento (#), que o Supabase usa; na query eles vazam em logs e links montados.
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (code) {
        const { data, error } = await this.client.auth.exchangeCodeForSession(code);
        if (error || !data.user?.email) throw new AuthError("Falha ao autenticar com o código recebido.");
        return { id: data.user.id, email: data.user.email, name: readFullName(data.user) };
      }

      if (accessToken && refreshToken) {
        // Um link montado por terceiros não pode trocar a conta de quem já está logado (login forçado).
        const { data: atual } = await this.client.auth.getSession();
        const usuarioAtual = atual.session?.user?.id;
        if (usuarioAtual && usuarioAtual !== tokenSubject(accessToken)) {
          throw new AuthError("Você já está conectado com outra conta. Saia antes de usar este link.");
        }
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
    await this.nativeGoogle?.signOut();
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
    // O banco não apaga arquivos do storage; sem isto as fotos seguiriam públicas após a exclusão.
    await this.removeUserPhotos(userId);
    const { error } = await this.client.rpc("delete_user_account", { target_user_id: userId });
    if (error) {
      throw new AuthError("Não foi possível excluir a conta. Tente novamente.");
    }
    await this.client.auth.signOut();
  }

  /** Remove a pasta `<userId>/` do bucket de fotos (arquivos soltos e um nível de subpastas por livro). */
  private async removeUserPhotos(userId: string): Promise<void> {
    try {
      const bucket = this.client.storage.from(BUCKET_NAME);
      const paths: string[] = [];
      const { data: raiz } = await bucket.list(userId);
      for (const item of raiz ?? []) {
        if (item.id) {
          paths.push(`${userId}/${item.name}`);
          continue;
        }
        const { data: arquivos } = await bucket.list(`${userId}/${item.name}`);
        for (const arquivo of arquivos ?? []) paths.push(`${userId}/${item.name}/${arquivo.name}`);
      }
      if (paths.length > 0) await bucket.remove(paths);
    } catch {
      // A exclusão da conta não pode travar por falha no storage.
    }
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

function tokenSubject(accessToken: string): string | null {
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const sub = (JSON.parse(json) as { sub?: unknown }).sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}
