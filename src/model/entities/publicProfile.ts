export type PublicProfile = Readonly<{
  userId: string;
  name: string;
  /** Data (ISO) de entrada na comunidade. */
  joinedAt: string;
  averageRating: number | null;
  ratingCount: number;
  completedNegotiations: number;
}>;
