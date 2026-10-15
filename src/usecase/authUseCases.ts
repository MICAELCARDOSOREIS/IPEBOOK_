import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError, ValidationError } from "@/model/errors";
import { validateAuthPayload, validateNewPassword } from "@/model/validators/authValidator";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";

export class AuthUseCases implements IAuthUseCases {
  constructor(private readonly dataSource: IAuthDataSource) {}

  async signUp(email: string, password: string): Promise<User> {
    const result = validateAuthPayload({ email, password });
    if (!result.isValid) {
      throw new ValidationError(result.errors[0]);
    }
    return this.dataSource.signUp(email.trim(), password);
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
