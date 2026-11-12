import type { AppVersionPolicy } from "@/model/entities/appUpdate";

export interface IAppVersionPolicyDataSource {
  getPolicy(): Promise<AppVersionPolicy | null>;
}
