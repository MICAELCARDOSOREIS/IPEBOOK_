export type ReceivedRating = Readonly<{
  id: string;
  raterId: string;
  /** Nome público de quem avaliou; `null` quando o perfil não pôde ser carregado. */
  raterName: string | null;
  score: number;
  createdAt: string;
}>;

export interface IRatingUseCases {
  listReceivedRatings(sessionUserId: string | null): Promise<readonly ReceivedRating[]>;
}
