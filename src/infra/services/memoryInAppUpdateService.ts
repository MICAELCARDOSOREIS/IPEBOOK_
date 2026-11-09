import type { IInAppUpdateService, StoreUpdateInfo } from "@/model/services/iInAppUpdateService";

export class MemoryInAppUpdateService implements IInAppUpdateService {
  constructor(private mockInfo: StoreUpdateInfo = { isUpdateAvailable: false }) {}

  setMockInfo(info: StoreUpdateInfo) {
    this.mockInfo = info;
  }

  async checkStoreUpdate(): Promise<StoreUpdateInfo> {
    return this.mockInfo;
  }

  async startUpdateFlow(): Promise<boolean> {
    return this.mockInfo.isUpdateAvailable;
  }
}
