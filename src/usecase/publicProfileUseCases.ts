import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { PublicProfile } from "@/model/entities/publicProfile";
import { ValidationError } from "@/model/errors";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";

function defaultName(userId: string): string {
  return `Usuário #${userId.slice(-4).toUpperCase()}`;
}

export class PublicProfileUseCases implements IPublicProfileUseCases {
  constructor(
    private readonly profiles: IProfileDataSource,
    private readonly ratings: IRatingDataSource,
    private readonly books: IBookDataSource,
    private readonly requests: IBookRequestDataSource,
  ) {}

  async getPublicProfile(userId: string): Promise<PublicProfile> {
    if (!userId) {
      throw new ValidationError("Usuário não encontrado.");
    }

    const profile = await this.profiles.ensure(userId, defaultName(userId));
    const userRatings = await this.ratings.listByRatedUser(userId);
    const averageRating = userRatings.length > 0
      ? userRatings.reduce((sum, rating) => sum + rating.score, 0) / userRatings.length
      : null;

    const completedNegotiations = await this.countCompletedNegotiations(userId);

    return {
      userId,
      name: profile.name,
      joinedAt: profile.joinedAt,
      averageRating,
      ratingCount: userRatings.length,
      completedNegotiations,
    };
  }

  private async countCompletedNegotiations(userId: string): Promise<number> {
    const ownedListings = await this.books.listByOwner(userId);
    let count = 0;
    for (const listing of ownedListings) {
      const listingRequests = await this.requests.listByListing(listing.id);
      count += listingRequests.filter((request) => request.status === "accepted").length;
    }
    const sentRequests = await this.requests.listByRequester(userId);
    count += sentRequests.filter((request) => request.status === "accepted").length;
    return count;
  }
}
