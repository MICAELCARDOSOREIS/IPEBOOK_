import type { Rating } from "@/model/entities/rating";

export interface IRatingDataSource {
  create(rating: Omit<Rating, "id" | "createdAt">): Promise<Rating>;
  listByRatedUser(userId: string): Promise<readonly Rating[]>;
  findByRequestAndRater(requestId: string, raterId: string): Promise<Rating | null>;
}
