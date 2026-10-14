import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError } from "@/model/errors";

type StoredAccount = Readonly<{
  id: string;
  email: string;
  password: string;
}>;

export class MemoryAuthDataSource implements IAuthDataSource {
  private readonly accountsByEmail = new Map<string, StoredAccount>();
  private session: User | null = null;
  private nextId = 1;

  async signUp(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.accountsByEmail.has(normalizedEmail)) {
      throw new AuthError("Este e-mail já está em uso.");
    }
    const account: StoredAccount = {
      id: String(this.nextId++),
      email: normalizedEmail,
      password,
    };
    this.accountsByEmail.set(normalizedEmail, account);
    const user: User = { id: account.id, email: account.email };
    this.session = { ...user };
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accountsByEmail.get(normalizedEmail);
    if (!account || account.password !== password) {
      throw new AuthError("Credenciais inválidas.");
    }
    const user: User = { id: account.id, email: account.email };
    this.session = { ...user };
    return user;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }

  async currentUser(): Promise<User | null> {
    return this.session ? { ...this.session } : null;
  }

  async requestPasswordReset(email: string): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accountsByEmail.get(normalizedEmail);
    if (!account) {
      throw new AuthError("Não há conta cadastrada com este e-mail.");
    }
    const temporaryPassword = generateTemporaryPassword();
    this.accountsByEmail.set(normalizedEmail, { ...account, password: temporaryPassword });
    return temporaryPassword;
  }
}

function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(2, 10).padEnd(8, "0");
}
