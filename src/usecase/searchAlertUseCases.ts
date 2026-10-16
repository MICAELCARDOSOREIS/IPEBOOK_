import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { Book } from "@/model/entities/book";
import { AuthError, ValidationError } from "@/model/errors";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";

export class SearchAlertUseCases implements ISearchAlertUseCases {
  constructor(private readonly alerts: ISearchAlertDataSource) {}

  private requireUser(userId: string | null): string {
    if (!userId?.trim()) throw new AuthError("Entre na sua conta para criar alertas.");
    return userId.trim();
  }

  listAlerts(userId: string | null) {
    return this.alerts.listByUser(this.requireUser(userId));
  }

  async createAlert(userId: string | null, query: string) {
    const owner = this.requireUser(userId);
    const value = query.trim();
    if (value.length < 2 || value.length > 100) {
      throw new ValidationError("Informe um termo entre 2 e 100 caracteres.");
    }
    return this.alerts.add(owner, value);
  }

  async setActive(userId: string | null, id: string, active: boolean) {
    const owner = this.requireUser(userId);
    if (!id.trim()) throw new ValidationError("Alerta inválido.");
    await this.alerts.setActive(owner, id, active);
  }

  async deleteAlert(userId: string | null, id: string) {
    const owner = this.requireUser(userId);
    if (!id.trim()) throw new ValidationError("Alerta inválido.");
    await this.alerts.remove(owner, id);
  }

  matchNewBook(book: Book) {
    return this.alerts.matchNewBook(book);
  }
}
