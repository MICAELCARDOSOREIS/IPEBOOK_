import {
  evaluateAppUpdateStatus,
  type AppUpdateResult,
} from "@/model/entities/appUpdate";
import type { IAppVersionPolicyDataSource } from "@/model/datasources/iAppVersionPolicyDataSource";
import type { IAppUpdateDismissDataSource } from "@/model/datasources/iAppUpdateDismissDataSource";
import type { IAppStoreLauncherService } from "@/model/services/iAppStoreLauncherService";
import type { IInAppUpdateService } from "@/model/services/iInAppUpdateService";

export class AppUpdateUseCases {
  constructor(
    private readonly policyDataSource: IAppVersionPolicyDataSource,
    private readonly dismissDataSource: IAppUpdateDismissDataSource,
    private readonly storeLauncher: IAppStoreLauncherService,
    private readonly installedVersion = "0.0.0",
    private readonly inAppUpdateService?: IInAppUpdateService,
  ) {}

  async checkUpdate(): Promise<AppUpdateResult> {
    try {
      // 1. Tenta verificar diretamente na loja (Google Play In-App Updates)
      if (this.inAppUpdateService) {
        try {
          const storeInfo = await this.inAppUpdateService.checkStoreUpdate();
          if (storeInfo.isUpdateAvailable) {
            const detectedVersion = storeInfo.versionName || "99.99.99";
            const dismissed = await this.dismissDataSource.getDismissedVersion();
            if (dismissed === detectedVersion) {
              return { status: "up_to_date", policy: null };
            }
            return {
              status: "optional",
              policy: {
                platform: "android",
                latestVersion: detectedVersion,
                minSupportedVersion: this.installedVersion,
                releaseNotes: null,
                storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app&hl=pt-BR",
              },
            };
          }
        } catch {
          // Fallback silencioso para a política remota
        }
      }

      // 2. Fallback para a política remota do Supabase
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
    if (this.inAppUpdateService?.startUpdateFlow) {
      const handled = await this.inAppUpdateService.startUpdateFlow();
      if (handled) return;
    }
    await this.storeLauncher.openStore(storeUrl);
  }
}
