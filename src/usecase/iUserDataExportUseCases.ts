import type { UserExportData } from '../model/entities/userExportData';

export interface IUserDataExportUseCases {
  exportUserData(userId: string): Promise<UserExportData>;
}
