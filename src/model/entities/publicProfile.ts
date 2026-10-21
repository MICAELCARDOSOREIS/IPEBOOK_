export type PublicProfile = Readonly<{
  userId: string;
  name: string;
  /** Data (ISO) de entrada na comunidade. */
  joinedAt: string;
  averageRating: number | null;
  ratingCount: number;
  completedNegotiations: number;
  photoUrl?: string;
  socialHandle?: string;
}>;

export type ProfileEdits = Readonly<{
  name: string;
  photoUrl?: string;
  socialHandle?: string;
}>;
