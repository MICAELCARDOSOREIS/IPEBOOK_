import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { UserExportData } from "@/model/entities/userExportData";

export class MemoryUserDataExportDataSource implements IUserDataExportDataSource {
  constructor(
    private readonly bookDataSource?: IBookDataSource,
    private readonly requestDataSource?: IBookRequestDataSource,
    private readonly favoriteDataSource?: IFavoriteDataSource,
    private readonly searchAlertDataSource?: ISearchAlertDataSource
  ) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    const allBooks = this.bookDataSource ? await this.bookDataSource.list() : [];
    const userListings = allBooks.filter((b) => b.ownerId === userId) as Book[];

    let sentRequests: BookRequest[] = [];
    if (this.requestDataSource) {
      const requests = await this.requestDataSource.listByRequester(userId);
      sentRequests = requests.map((r) => ({ ...r }));
    }

    const receivedRequests: BookRequest[] = [];
    if (this.requestDataSource) {
      for (const listing of userListings) {
        const reqs = await this.requestDataSource.listByListing(listing.id);
        receivedRequests.push(...reqs.map((r) => ({ ...r })));
      }
    }

    let favoriteIds: string[] = [];
    if (this.favoriteDataSource) {
      const favs = await this.favoriteDataSource.listByUser(userId);
      favoriteIds = favs.map((f) => f.bookId);
    }

    const searchAlerts = this.searchAlertDataSource
      ? (await this.searchAlertDataSource.listByUser(userId)).map((a) => ({ ...a }))
      : [];

    return {
      userId,
      exportedAt: new Date().toISOString(),
      listings: userListings,
      sentRequests,
      receivedRequests,
      favorites: favoriteIds,
      searchAlerts,
    };
  }
}
