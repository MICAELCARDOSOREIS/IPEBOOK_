import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { ValidationError } from "@/model/errors";
import { validateAuthPayload } from "@/model/validators/authValidator";
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
}
