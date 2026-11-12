import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { Rating } from "@/model/entities/rating";

export class MemoryRatingDataSource implements IRatingDataSource {
  private readonly ratings: Rating[];

  constructor(ratings: readonly Rating[] = []) {
    this.ratings = ratings.map((rating) => ({ ...rating }));
  }

  async create(rating: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    const created: Rating = {
      ...rating,
      id: `rating-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.ratings.push({ ...created });
    return { ...created };
  }

  async listByRatedUser(userId: string): Promise<readonly Rating[]> {
    return this.ratings.filter((rating) => rating.ratedUserId === userId).map((rating) => ({ ...rating }));
  }

  async listByRater(userId: string): Promise<readonly Rating[]> {
    return this.ratings.filter((rating) => rating.raterId === userId).map((rating) => ({ ...rating }));
  }

  async findByRequestAndRater(requestId: string, raterId: string): Promise<Rating | null> {
    const found = this.ratings.find(
      (rating) => rating.requestId === requestId && rating.raterId === raterId,
    );
    return found ? { ...found } : null;
  }
}
