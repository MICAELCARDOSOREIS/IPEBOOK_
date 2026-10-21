export type StoredProfile = Readonly<{
  userId: string;
  name: string;
  joinedAt: string;
  photoUrl?: string;
  socialHandle?: string;
}>;

export type ProfileUpdate = Readonly<{
  name: string;
  photoUrl?: string;
  socialHandle?: string;
}>;

export interface IProfileDataSource {
  findById(userId: string): Promise<StoredProfile | null>;
  /** Cria o perfil público com nome padrão se ainda não existir; idempotente. */
  ensure(userId: string, defaultName: string): Promise<StoredProfile>;
  update(userId: string, patch: ProfileUpdate): Promise<StoredProfile>;
}
