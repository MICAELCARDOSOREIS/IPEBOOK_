export interface IAppStoreLauncherService {
  openStore(storeUrl: string): Promise<void>;
}
