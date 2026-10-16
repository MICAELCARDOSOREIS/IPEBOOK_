import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { Favorite } from "@/model/entities/favorite";

export class MemoryFavoriteDataSource implements IFavoriteDataSource {
  private entries: Favorite[] = [];

  async listByUser(userId: string) {
    return this.entries.filter((entry) => entry.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async add(userId: string, bookId: string) {
    const existing = this.entries.find((entry) => entry.userId === userId && entry.bookId === bookId);
    if (existing) return existing;
    const created = { id: `favorite-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, userId, bookId, createdAt: new Date().toISOString() };
    this.entries.push(created);
    return created;
  }

  async remove(userId: string, bookId: string) {
    this.entries = this.entries.filter((entry) => entry.userId !== userId || entry.bookId !== bookId);
  }
}
