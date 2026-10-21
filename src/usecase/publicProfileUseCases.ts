import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { ProfileEdits, PublicProfile } from "@/model/entities/publicProfile";
import { ValidationError } from "@/model/errors";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";

const MAX_NAME_LENGTH = 60;
const MAX_SOCIAL_HANDLE_LENGTH = 60;

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
      photoUrl: profile.photoUrl,
      socialHandle: profile.socialHandle,
    };
  }

  async updateProfile(userId: string, edits: ProfileEdits): Promise<PublicProfile> {
    if (!userId) throw new ValidationError("Usuário não encontrado.");
    const name = edits.name.trim();
    if (!name) throw new ValidationError("Informe um nome público.");
    if (name.length > MAX_NAME_LENGTH) throw new ValidationError(`O nome público deve ter até ${MAX_NAME_LENGTH} caracteres.`);

    const photoUrl = edits.photoUrl?.trim() || undefined;
    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      throw new ValidationError("A foto deve ser um link (http/https) válido.");
    }

    const socialHandle = edits.socialHandle?.trim() || undefined;
    if (socialHandle && socialHandle.length > MAX_SOCIAL_HANDLE_LENGTH) {
      throw new ValidationError(`A rede social deve ter até ${MAX_SOCIAL_HANDLE_LENGTH} caracteres.`);
    }

    await this.profiles.ensure(userId, defaultName(userId));
    await this.profiles.update(userId, { name, photoUrl, socialHandle });
    return this.getPublicProfile(userId);
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
