import {
  evaluateAppUpdateStatus,
  formatPolicyVersionKey,
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
    private readonly installedVersionCode?: number,
  ) {}

  async checkUpdate(): Promise<AppUpdateResult> {
    try {
      let currentVersion = this.installedVersion;
      let currentVersionCode = this.installedVersionCode;

      // 1. Tenta verificar diretamente na loja (Google Play In-App Updates)
      if (this.inAppUpdateService) {
        try {
          const storeInfo = await this.inAppUpdateService.checkStoreUpdate();
          if (storeInfo.installedVersionName) {
            currentVersion = storeInfo.installedVersionName;
          }
          if (typeof storeInfo.installedVersionCode === "number") {
            currentVersionCode = storeInfo.installedVersionCode;
          }
          if (storeInfo.isUpdateAvailable) {
            const hasDistinctVersionName =
              Boolean(storeInfo.versionName) && storeInfo.versionName !== currentVersion;
            const detectedVersion = hasDistinctVersionName
              ? (storeInfo.versionName as string)
              : typeof storeInfo.versionCode === "number" && storeInfo.versionCode > 0
                ? `${currentVersion}+${storeInfo.versionCode}`
                : storeInfo.versionName || "99.99.99";
            const dismissed = await this.dismissDataSource.getDismissedVersion();
            if (dismissed === detectedVersion) {
              return { status: "up_to_date", policy: null };
            }
            return {
              status: "optional",
              policy: {
                platform: "android",
                latestVersion: detectedVersion,
                minSupportedVersion: currentVersion,
                latestVersionCode: storeInfo.versionCode,
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
      const rawPolicy = await this.policyDataSource.getPolicy();
      if (!rawPolicy) return { status: "up_to_date", policy: null };
      const status = evaluateAppUpdateStatus(currentVersion, rawPolicy, currentVersionCode);
      const versionKey =
        compareSemverOrCodeKey(currentVersion, rawPolicy) ? formatPolicyVersionKey(rawPolicy) : rawPolicy.latestVersion;
      const policy = versionKey !== rawPolicy.latestVersion ? { ...rawPolicy, latestVersion: versionKey } : rawPolicy;
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

function compareSemverOrCodeKey(installedVersion: string, policy: { latestVersion: string; latestVersionCode?: number }): boolean {
  return installedVersion === policy.latestVersion && typeof policy.latestVersionCode === "number" && policy.latestVersionCode > 1;
}
