import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import { AuthError } from "@/model/errors";
import type { IRatingUseCases, ReceivedRating } from "@/usecase/iRatingUseCases";

function requireSession(sessionUserId: string | null): string {
  if (!sessionUserId) {
    throw new AuthError("Sessão obrigatória para ver suas avaliações.");
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
}
