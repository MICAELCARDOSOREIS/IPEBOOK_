import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { Book, BookModality } from "@/model/entities/book";
import { ALL_ALERT_MODALITIES } from "@/model/entities/searchAlert";
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

  private requireQuery(query: string): string {
    const value = query.trim();
    if (value.length < 2 || value.length > 100) {
      throw new ValidationError("Informe um termo entre 2 e 100 caracteres.");
    }
    return value;
  }

  /** `02.10` exige pelo menos um tipo de anúncio selecionado. */
  private requireModalities(modalities: readonly BookModality[]): readonly BookModality[] {
    const chosen = ALL_ALERT_MODALITIES.filter((modality) => modalities.includes(modality));
    if (chosen.length === 0) throw new ValidationError("Selecione pelo menos um tipo.");
    return chosen;
  }

  async createAlert(
    userId: string | null,
    query: string,
    modalities: readonly BookModality[] = ALL_ALERT_MODALITIES,
  ) {
    const owner = this.requireUser(userId);
    return this.alerts.add(owner, this.requireQuery(query), this.requireModalities(modalities));
  }

  async updateAlert(
    userId: string | null,
    id: string,
    query: string,
    modalities?: readonly BookModality[],
  ) {
    const owner = this.requireUser(userId);
    if (!id.trim()) throw new ValidationError("Alerta inválido.");
    await this.alerts.update(owner, id, this.requireQuery(query), modalities === undefined ? undefined : this.requireModalities(modalities));
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
