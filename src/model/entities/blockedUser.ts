/**
 * Entidade que representa um usuário bloqueado no ecossistema comunitário (Spec 056 / ADR 0039).
 */
export type BlockedUser = Readonly<{
  userId: string;
  name: string;
  blockedAt: string;
  photoUrl?: string;
}>;
