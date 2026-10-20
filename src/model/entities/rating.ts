export type Rating = Readonly<{
  id: string;
  raterId: string;
  ratedUserId: string;
  requestId: string;
  /** Nota de 1 a 5. */
  score: number;
  createdAt: string;
}>;
