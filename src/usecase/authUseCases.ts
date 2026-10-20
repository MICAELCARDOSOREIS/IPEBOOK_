import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { User } from "@/model/entities/user";
import { AuthError, ValidationError } from "@/model/errors";
import {
  validateAuthPayload,
  validateNewPassword,
  validateSignUpPayload,
} from "@/model/validators/authValidator";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";

export class AuthUseCases implements IAuthUseCases {
  constructor(
    private readonly dataSource: IAuthDataSource,
    private readonly profiles?: IProfileDataSource,
  ) {}

  async signUp(email: string, password: string, name: string): Promise<User> {
    const result = validateSignUpPayload({ email, password, name });
    if (!result.isValid) {
      throw new ValidationError(result.errors[0]);
    }
    const user = await this.dataSource.signUp(email.trim(), password, name.trim());
    await this.ensurePublicProfile(user.id, name.trim());
    return user;
  }

  /**
   * Leva o nome do cadastro para o perfil público (Spec 018). A conta já foi criada neste ponto,
   * então uma falha aqui não desfaz o cadastro: o perfil volta a ser criado sob demanda, com o
   * nome padrão, na primeira visita ao perfil público.
   */
  private async ensurePublicProfile(userId: string, name: string): Promise<void> {
    if (!this.profiles) return;
    try {
      await this.profiles.ensure(userId, name);
    } catch {
      // Perfil público é complementar ao cadastro; ver Spec 030 e validacao.md.
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    const result = validateAuthPayload({ email, password });
    if (!result.isValid) {
      throw new ValidationError(result.errors[0]);
    }
    return this.dataSource.signIn(email.trim(), password);
  }

  signOut(): Promise<void> {
    return this.dataSource.signOut();
  }

  getSession(): Promise<User | null> {
    return this.dataSource.currentUser();
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.dataSource.requestPasswordReset(email.trim());
  }

  async completePasswordReset(link: string | null, newPassword: string): Promise<void> {
    const validation = validateNewPassword(newPassword);
    if (!validation.isValid) throw new ValidationError(validation.errors[0]);
    return this.dataSource.completePasswordReset(link, newPassword);
  }

  async deleteAccount(sessionUserId: string | null): Promise<void> {
    if (!sessionUserId || !sessionUserId.trim()) {
      throw new AuthError("Sessão obrigatória para excluir a conta.");
    }
    await this.dataSource.deleteAccount(sessionUserId.trim());
  }
}
