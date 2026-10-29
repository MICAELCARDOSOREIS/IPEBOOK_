import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { Rating } from "@/model/entities/rating";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type RatingRow = {
  id: string;
  rater_id: string;
  rated_user_id: string;
  request_id: string;
  score: number;
  created_at: string;
};

function mapRating(row: RatingRow): Rating {
  return {
    id: row.id,
    raterId: row.rater_id,
    ratedUserId: row.rated_user_id,
    requestId: row.request_id,
    score: row.score,
    createdAt: row.created_at,
  };
}

const columns = "id,rater_id,rated_user_id,request_id,score,created_at";

export class SupabaseRatingDataSource implements IRatingDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async create(rating: Omit<Rating, "id" | "createdAt">): Promise<Rating> {
    const { data, error } = await this.client.from("v2_ratings").insert({
      rater_id: rating.raterId,
      rated_user_id: rating.ratedUserId,
      request_id: rating.requestId,
      score: rating.score,
    }).select(columns).single();
    if (error || !data) throw new DataSourceError("Não foi possível registrar a avaliação.");
    return mapRating(data as RatingRow);
  }

  async listByRatedUser(userId: string): Promise<readonly Rating[]> {
    const { data, error } = await this.client.from("v2_ratings").select(columns).eq("rated_user_id", userId);
    if (error) throw new DataSourceError("Não foi possível carregar as avaliações.");
    return (data as RatingRow[]).map(mapRating);
  }
}
