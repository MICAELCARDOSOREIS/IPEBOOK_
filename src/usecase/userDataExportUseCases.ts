import type { IUserDataExportDataSource } from '../model/datasources/iUserDataExportDataSource';
import type { UserExportData } from '../model/entities/userExportData';
import type { IUserDataExportUseCases } from './iUserDataExportUseCases';

export class UserDataExportUseCases implements IUserDataExportUseCases {
  constructor(private readonly dataSource: IUserDataExportDataSource) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    const trimmedId = userId?.trim();
    if (!trimmedId) {
      throw new Error('Identificador de usuário inválido para exportação de dados.');
    }
    return this.dataSource.exportUserData(trimmedId);
  }
}
