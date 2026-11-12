export interface IAppUpdateDismissDataSource {
  getDismissedVersion(): Promise<string | null>;
  dismissVersion(version: string): Promise<void>;
}
