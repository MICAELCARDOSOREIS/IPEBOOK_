export type StoredProfile = Readonly<{
  userId: string;
  name: string;
  joinedAt: string;
}>;

export interface IProfileDataSource {
  findById(userId: string): Promise<StoredProfile | null>;
  /** Cria o perfil público com nome padrão se ainda não existir; idempotente. */
  ensure(userId: string, defaultName: string): Promise<StoredProfile>;
}
