import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { Rating } from "@/model/entities/rating";
import { AuthError, DuplicateRatingError } from "@/model/errors";
import { validateRatingParams } from "@/model/validators/ratingValidator";
import type { IRatingUseCases, ReceivedRating, SubmitRatingParams } from "@/usecase/iRatingUseCases";

function requireSession(sessionUserId: string | null): string {
  if (!sessionUserId) {
    throw new AuthError("Sessão obrigatória para acessar avaliações.");
  }
  return sessionUserId;
}

export class RatingUseCases implements IRatingUseCases {
  constructor(
    private readonly ratings: IRatingDataSource,
    private readonly profiles: IProfileDataSource,
  ) {}

  async listReceivedRatings(sessionUserId: string | null): Promise<readonly ReceivedRating[]> {
    const userId = requireSession(sessionUserId);
    const ratings = await this.ratings.listByRatedUser(userId);
    const sorted = [...ratings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const result: ReceivedRating[] = [];
    for (const rating of sorted) {
      const rater = await this.profiles.findById(rating.raterId);
      result.push({
        id: rating.id,
        raterId: rating.raterId,
        raterName: rater?.name ?? null,
        score: rating.score,
        createdAt: rating.createdAt,
      });
    }
    return result;
  }

  async submitRating(sessionUserId: string | null, params: SubmitRatingParams): Promise<Rating> {
    const raterId = requireSession(sessionUserId);
    validateRatingParams({
      requestId: params.requestId,
      raterId,
      ratedUserId: params.ratedUserId,
      score: params.score,
    });

    const existing = await this.ratings.findByRequestAndRater(params.requestId, raterId);
    if (existing) {
      throw new DuplicateRatingError("Você já avaliou esta negociação.");
    }

    return this.ratings.create({
      raterId,
      ratedUserId: params.ratedUserId,
      requestId: params.requestId,
      score: params.score,
    });
  }

  async getNegotiationRating(sessionUserId: string | null, requestId: string): Promise<Rating | null> {
    if (!sessionUserId) return null;
    return this.ratings.findByRequestAndRater(requestId, sessionUserId);
  }
}
