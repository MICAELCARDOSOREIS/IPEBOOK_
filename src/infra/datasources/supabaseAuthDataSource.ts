import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

/** Nome informado no cadastro, guardado em `user_metadata.full_name` (ver Spec 030). */
function readFullName(user: { user_metadata?: Record<string, unknown> | null }): string | undefined {
  const value = user.user_metadata?.full_name;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
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
    if (error || !data.user?.email) {
      throw new AuthError("Não foi possível criar a conta. Tente novamente.");
    }
    return { id: data.user.id, email: data.user.email, name: readFullName(data.user) ?? name };
  }

  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user?.email) {
      throw new AuthError("Credenciais inválidas ou conta ainda não confirmada.");
    }
    return { id: data.user.id, email: data.user.email, name: readFullName(data.user) };
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
    if (!link) throw new AuthError("Link de recuperação inválido ou expirado.");
    try {
      const parsed = new URL(link);
      const query = new URLSearchParams(parsed.search);
      const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));
      const code = query.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (code) {
        const { error } = await this.client.auth.exchangeCodeForSession(code);
        if (error) throw new AuthError("Link de recuperação inválido ou expirado.");
      } else if (accessToken && refreshToken) {
        const { error } = await this.client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw new AuthError("Link de recuperação inválido ou expirado.");
      } else {
        throw new AuthError("Link de recuperação inválido ou expirado.");
      }
    } catch {
      throw new AuthError("Link de recuperação inválido ou expirado.");
    }

    const { data: sessionData, error: sessionError } = await this.client.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new AuthError("Link de recuperação inválido ou expirado.");
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
