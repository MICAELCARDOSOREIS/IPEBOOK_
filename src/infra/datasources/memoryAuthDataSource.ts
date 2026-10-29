import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { User } from "@/model/entities/user";
import { AuthError, EmailAlreadyRegisteredError } from "@/model/errors";

type StoredAccount = Readonly<{
  id: string;
  email: string;
  password: string;
  name: string;
}>;

export class MemoryAuthDataSource implements IAuthDataSource {
  private readonly accountsByEmail = new Map<string, StoredAccount>();
  private session: User | null = null;
  private nextId = 1;

  async signUp(email: string, password: string, name: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.accountsByEmail.has(normalizedEmail)) {
      throw new EmailAlreadyRegisteredError("Este e-mail já está em uso.");
    }
    const account: StoredAccount = {
      id: String(this.nextId++),
      email: normalizedEmail,
      password,
      name: name.trim(),
    };
    this.accountsByEmail.set(normalizedEmail, account);
    const user: User = { id: account.id, email: account.email, name: account.name };
    this.session = { ...user };
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accountsByEmail.get(normalizedEmail);
    if (!account || account.password !== password) {
      throw new AuthError("Credenciais inválidas.");
    }
    const user: User = { id: account.id, email: account.email, name: account.name };
    this.session = { ...user };
    return user;
  }

  async signOut(): Promise<void> {
    this.session = null;
  }

  async currentUser(): Promise<User | null> {
    return this.session ? { ...this.session } : null;
  }

  async requestPasswordReset(_email: string): Promise<void> {
    throw new AuthError("Recuperação por e-mail indisponível no modo local.");
  }

  async completePasswordReset(_link: string | null, _newPassword: string): Promise<void> {
    throw new AuthError("Recuperação por e-mail indisponível no modo local.");
  }

  async deleteAccount(userId: string): Promise<void> {
    for (const [email, account] of this.accountsByEmail.entries()) {
      if (account.id === userId) {
        this.accountsByEmail.delete(email);
        break;
      }
    }
    if (this.session?.id === userId) {
      this.session = null;
    }
  }
}
