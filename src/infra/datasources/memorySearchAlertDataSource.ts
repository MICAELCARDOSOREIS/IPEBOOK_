import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { Book } from "@/model/entities/book";
import type { SearchAlert } from "@/model/entities/searchAlert";

export class MemorySearchAlertDataSource implements ISearchAlertDataSource {
  private entries: SearchAlert[] = [];
  constructor(private readonly notifications: INotificationDataSource) {}

  async listByUser(userId: string) {
    return this.entries.filter((entry) => entry.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async add(userId: string, query: string) {
    const created = { id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, userId, query, active: true, createdAt: new Date().toISOString() };
    this.entries.push(created);
    return created;
  }

  async update(userId: string, id: string, query: string) {
    this.entries = this.entries.map((entry) => entry.id === id && entry.userId === userId ? { ...entry, query } : entry);
  }

  async setActive(userId: string, id: string, active: boolean) {
    this.entries = this.entries.map((entry) => entry.id === id && entry.userId === userId ? { ...entry, active } : entry);
  }

  async remove(userId: string, id: string) {
    this.entries = this.entries.filter((entry) => entry.id !== id || entry.userId !== userId);
  }

  async matchNewBook(book: Book) {
    for (const entry of this.entries) {
      const term = entry.query.toLocaleLowerCase("pt-BR");
      if (!entry.active || entry.userId === book.ownerId ||
        ![book.title, book.author, book.category ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(term))) continue;
      await this.notifications.addNotification({
        id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, userId: entry.userId, title: "Livro encontrado para seu alerta",
        message: `Um novo anúncio corresponde a “${entry.query}”.`, type: "search_alert_match",
        read: false, createdAt: new Date().toISOString(), actionUrl: `/livro/${book.id}`,
      });
    }
  }
}
