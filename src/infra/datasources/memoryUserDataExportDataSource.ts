import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { UserExportData } from "@/model/entities/userExportData";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import type { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";

type ExportExtras = {
  auth?: IAuthDataSource;
  profiles?: IProfileDataSource;
  notifications?: INotificationDataSource;
  reports?: MemoryReportDataSource;
  ratings?: MemoryRatingDataSource;
};

export class MemoryUserDataExportDataSource implements IUserDataExportDataSource {
  constructor(
    private readonly bookDataSource?: IBookDataSource,
    private readonly requestDataSource?: IBookRequestDataSource,
    private readonly favoriteDataSource?: IFavoriteDataSource,
    private readonly searchAlertDataSource?: ISearchAlertDataSource,
    private readonly extras: ExportExtras = {},
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

    const [session, profile, notifications, reports, ratingsGiven, ratingsReceived] = await Promise.all([
      this.extras.auth?.currentUser() ?? null,
      this.extras.profiles?.findById(userId) ?? null,
      this.extras.notifications?.listByUser(userId) ?? [],
      this.extras.reports?.listByReporter(userId) ?? [],
      this.extras.ratings?.listByRater(userId) ?? [],
      this.extras.ratings?.listByRatedUser(userId) ?? [],
    ]);
    const account = session?.id === userId ? session : null;

    return {
      userId,
      exportedAt: new Date().toISOString(),
      account,
      profile: profile ? {
        name: profile.name,
        joinedAt: profile.joinedAt,
        photoUrl: profile.photoUrl,
        socialHandle: profile.socialHandle,
      } : null,
      listings: userListings,
      sentRequests,
      receivedRequests,
      favorites: favoriteIds,
      searchAlerts,
      searchHistory: [],
      notifications: notifications.map((item) => ({ ...item })),
      reports: reports.map((item) => ({ ...item })),
      ratingsGiven: ratingsGiven.map((item) => ({ ...item })),
      ratingsReceived: ratingsReceived.map((item) => ({ ...item })),
    };
  }
}
