import type { Rating } from "@/model/entities/rating";

export type ReceivedRating = Readonly<{
  id: string;
  raterId: string;
  /** Nome público de quem avaliou; `null` quando o perfil não pôde ser carregado. */
  raterName: string | null;
  score: number;
  createdAt: string;
}>;

export type SubmitRatingParams = Readonly<{
  requestId: string;
  ratedUserId: string;
  score: number;
}>;

export interface IRatingUseCases {
  listReceivedRatings(sessionUserId: string | null): Promise<readonly ReceivedRating[]>;
  submitRating(sessionUserId: string | null, params: SubmitRatingParams): Promise<Rating>;
  getNegotiationRating(sessionUserId: string | null, requestId: string): Promise<Rating | null>;
}
