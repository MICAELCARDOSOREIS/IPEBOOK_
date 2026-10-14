import type { User } from "@/model/entities/user";

export interface IAuthUseCases {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getSession(): Promise<User | null>;
  requestPasswordReset(email: string): Promise<string>;
}
