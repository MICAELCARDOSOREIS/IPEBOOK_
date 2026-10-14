import type { User } from "@/model/entities/user";

export interface IAuthDataSource {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
}
