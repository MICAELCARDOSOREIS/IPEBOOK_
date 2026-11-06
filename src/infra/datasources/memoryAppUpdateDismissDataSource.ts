import type { IAppUpdateDismissDataSource } from "@/model/datasources/iAppUpdateDismissDataSource";

export class MemoryAppUpdateDismissDataSource implements IAppUpdateDismissDataSource {
  private dismissedVersion: string | null = null;
  async getDismissedVersion() {
    return this.dismissedVersion;
  }
  async dismissVersion(version: string) {
    this.dismissedVersion = version;
  }
}
