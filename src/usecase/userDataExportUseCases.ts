import type { IUserDataExportDataSource } from '../model/datasources/iUserDataExportDataSource';
import type { UserExportData } from '../model/entities/userExportData';
import type { IUserDataExportUseCases } from './iUserDataExportUseCases';
import type { ISearchHistoryUseCases } from './iSearchHistoryUseCases';

export class UserDataExportUseCases implements IUserDataExportUseCases {
  constructor(
    private readonly dataSource: IUserDataExportDataSource,
    private readonly searchHistory?: ISearchHistoryUseCases,
  ) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    const trimmedId = userId?.trim();
    if (!trimmedId) {
      throw new Error('Identificador de usuário inválido para exportação de dados.');
    }
    const data = await this.dataSource.exportUserData(trimmedId);
    return {
      ...data,
      searchHistory: this.searchHistory
        ? [...await this.searchHistory.listTerms(trimmedId)]
        : data.searchHistory,
    };
  }
}
