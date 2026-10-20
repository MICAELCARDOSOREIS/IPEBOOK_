import type { PublicProfile } from "@/model/entities/publicProfile";

export interface IPublicProfileUseCases {
  getPublicProfile(userId: string): Promise<PublicProfile>;
}
