import { NativeModules, Platform } from "react-native";
import type { IInAppUpdateService, StoreUpdateInfo } from "@/model/services/iInAppUpdateService";

type NativePlayUpdateModule = {
  checkStoreUpdate?: () => Promise<{
    isUpdateAvailable?: boolean;
    versionCode?: number;
    versionName?: string;
    installedVersionCode?: number;
    installedVersionName?: string;
  }>;
  startUpdateFlow?: () => Promise<boolean>;
};

type NativeSentryModule = {
  fetchNativeRelease?: () => Promise<{
    id?: string;
    version?: string;
    build?: string;
  } | null>;
};

export class GooglePlayInAppUpdateService implements IInAppUpdateService {
  async checkStoreUpdate(): Promise<StoreUpdateInfo> {
    if (Platform.OS !== "android") {
      return { isUpdateAvailable: false };
    }
    try {
      const modules = NativeModules as {
        IpebookPlayUpdate?: NativePlayUpdateModule;
        RNSentry?: NativeSentryModule;
      };
      if (modules.IpebookPlayUpdate?.checkStoreUpdate) {
        const info = await modules.IpebookPlayUpdate.checkStoreUpdate();
        return {
          isUpdateAvailable: Boolean(info?.isUpdateAvailable),
          versionCode: typeof info?.versionCode === "number" && info.versionCode > 0 ? info.versionCode : undefined,
          versionName: typeof info?.versionName === "string" && info.versionName ? info.versionName : undefined,
          installedVersionCode:
            typeof info?.installedVersionCode === "number" && info.installedVersionCode > 0
              ? info.installedVersionCode
              : undefined,
          installedVersionName:
            typeof info?.installedVersionName === "string" && info.installedVersionName
              ? info.installedVersionName
              : undefined,
        };
      }

      if (modules.RNSentry?.fetchNativeRelease) {
        const release = await modules.RNSentry.fetchNativeRelease();
        const buildCode = release?.build ? Number(release.build) : Number.NaN;
        return {
          isUpdateAvailable: false,
          installedVersionCode: Number.isInteger(buildCode) && buildCode > 0 ? buildCode : undefined,
          installedVersionName: release?.version || undefined,
        };
      }

      return { isUpdateAvailable: false };
    } catch {
      return { isUpdateAvailable: false };
    }
  }

  async startUpdateFlow(): Promise<boolean> {
    if (Platform.OS !== "android") return false;
    try {
      const modules = NativeModules as { IpebookPlayUpdate?: NativePlayUpdateModule };
      if (modules.IpebookPlayUpdate?.startUpdateFlow) {
        return Boolean(await modules.IpebookPlayUpdate.startUpdateFlow());
      }
      return false;
    } catch {
      return false;
    }
  }
}
