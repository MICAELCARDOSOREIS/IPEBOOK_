import type { User } from "@/model/entities/user";

export interface IAuthDataSource {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
  /** Gera uma senha temporária para a conta do e-mail informado e a define como senha atual. */
  requestPasswordReset(email: string): Promise<string>;
}
