export interface StoreUpdateInfo {
  isUpdateAvailable: boolean;
  versionCode?: number;
  versionName?: string;
}

export interface IInAppUpdateService {
  checkStoreUpdate(): Promise<StoreUpdateInfo>;
  startUpdateFlow?(): Promise<boolean>;
}
