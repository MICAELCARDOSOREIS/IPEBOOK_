import type { ProfileEdits, PublicProfile } from "@/model/entities/publicProfile";

export interface IPublicProfileUseCases {
  getPublicProfile(userId: string): Promise<PublicProfile>;
  updateProfile(userId: string, edits: ProfileEdits): Promise<PublicProfile>;
}
