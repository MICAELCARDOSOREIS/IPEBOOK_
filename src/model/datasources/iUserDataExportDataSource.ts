import type { UserExportData } from '../entities/userExportData';

export interface IUserDataExportDataSource {
  exportUserData(userId: string): Promise<UserExportData>;
}
