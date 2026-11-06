import type { IAppStoreLauncherService } from "@/model/services/iAppStoreLauncherService";

export class MemoryAppStoreLauncherService implements IAppStoreLauncherService {
  public lastUrl: string | null = null;
  async openStore(storeUrl: string) {
    this.lastUrl = storeUrl;
  }
}
