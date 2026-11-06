import type { IAppVersionPolicyDataSource } from "@/model/datasources/iAppVersionPolicyDataSource";
import type { AppVersionPolicy } from "@/model/entities/appUpdate";

export class MemoryAppVersionPolicyDataSource implements IAppVersionPolicyDataSource {
  constructor(private readonly policy: AppVersionPolicy | null = null) {}
  async getPolicy() {
    return this.policy;
  }
}
