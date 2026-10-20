export interface IFileDownloadService {
  downloadJson(filename: string, data: unknown): Promise<boolean>;
}
