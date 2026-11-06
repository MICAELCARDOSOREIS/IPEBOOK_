import {
  evaluateAppUpdateStatus,
  type AppUpdateResult,
} from "@/model/entities/appUpdate";
import type { IAppVersionPolicyDataSource } from "@/model/datasources/iAppVersionPolicyDataSource";
import type { IAppUpdateDismissDataSource } from "@/model/datasources/iAppUpdateDismissDataSource";
import type { IAppStoreLauncherService } from "@/model/services/iAppStoreLauncherService";

export class AppUpdateUseCases {
  constructor(
    private readonly policyDataSource: IAppVersionPolicyDataSource,
    private readonly dismissDataSource: IAppUpdateDismissDataSource,
    private readonly storeLauncher: IAppStoreLauncherService,
    private readonly installedVersion = "0.0.0",
  ) {}

  async checkUpdate(): Promise<AppUpdateResult> {
    try {
      const policy = await this.policyDataSource.getPolicy();
      if (!policy) return { status: "up_to_date", policy: null };
      const status = evaluateAppUpdateStatus(this.installedVersion, policy);
      if (status === "optional" && (await this.dismissDataSource.getDismissedVersion()) === policy.latestVersion) {
        return { status: "up_to_date", policy };
      }
      return { status, policy };
    } catch {
      return { status: "up_to_date", policy: null };
    }
  }

  async dismiss(latestVersion: string): Promise<void> {
    await this.dismissDataSource.dismissVersion(latestVersion);
  }

  async openStore(storeUrl: string): Promise<void> {
    await this.storeLauncher.openStore(storeUrl);
  }
}
