import type { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
import type { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IDeliveryDataSource } from "@/model/datasources/iDeliveryDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { IMeetingDataSource } from "@/model/datasources/iMeetingDataSource";
import type { IMessageDataSource } from "@/model/datasources/iMessageDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { IUserPreferencesDataSource } from "@/model/datasources/iUserPreferencesDataSource";
import type { Delivery } from "@/model/entities/delivery";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type {
  ExportedBlockedUser,
  ExportedBook,
  ExportedBookRequest,
  ExportedHiddenConversation,
  ExportedUserPreferences,
  UserExportData,
} from "@/model/entities/userExportData";

type ExportExtras = {
  auth?: IAuthDataSource;
  profiles?: IProfileDataSource;
  userPreferences?: IUserPreferencesDataSource;
  messages?: IMessageDataSource;
  meetings?: IMeetingDataSource;
  deliveries?: IDeliveryDataSource;
  blockedUsers?: IBlockedUserDataSource;
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
    const ownedBooks = this.bookDataSource
      ? this.bookDataSource.listByOwner
        ? await this.bookDataSource.listByOwner(userId)
        : (await this.bookDataSource.list()).filter((b) => b.ownerId === userId)
      : [];
    const userListings = ownedBooks.map((b) => ({ ...b })) as ExportedBook[];

    let sentRequests: ExportedBookRequest[] = [];
    if (this.requestDataSource) {
      const requests = await this.requestDataSource.listByRequester(userId);
      sentRequests = requests.map((r) => ({ ...r }));
    }

    const receivedRequests: ExportedBookRequest[] = [];
    if (this.requestDataSource) {
      for (const listing of userListings) {
        const reqs = await this.requestDataSource.listByListing(listing.id);
        receivedRequests.push(...reqs.map((r) => ({ ...r })));
      }
    }

    const allRequestIds = [...new Set([...sentRequests.map((r) => r.id), ...receivedRequests.map((r) => r.id)])];

    const negotiationMessages: NegotiationMessage[] = [];
    if (this.extras.messages) {
      for (const requestId of allRequestIds) {
        const msgs = await this.extras.messages.getMessagesByRequestId(requestId);
        negotiationMessages.push(...msgs.map((m) => ({ ...m })));
      }
    }

    const deliveries: Delivery[] = [];
    if (this.extras.deliveries) {
      for (const requestId of allRequestIds) {
        const delivery = await this.extras.deliveries.findByRequest(requestId);
        if (delivery) deliveries.push({ ...delivery });
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

    const [
      session,
      profile,
      storedPreferences,
      meetings,
      notifications,
      reports,
      userReports,
      blockedList,
      hiddenMap,
      ratingsGiven,
      ratingsReceived,
    ] = await Promise.all([
      this.extras.auth?.currentUser() ?? null,
      this.extras.profiles?.findById(userId) ?? null,
      this.extras.userPreferences?.findById(userId) ?? null,
      this.extras.meetings?.listByUser(userId) ?? [],
      this.extras.notifications?.listByUser(userId) ?? [],
      this.extras.reports?.listByReporter(userId) ?? [],
      this.extras.reports?.listUserReportsByReporter(userId) ?? [],
      this.extras.blockedUsers?.listBlocked(userId) ?? [],
      this.extras.messages?.listHiddenConversations?.(userId) ?? ({} as Record<string, string>),
      this.extras.ratings?.listByRater(userId) ?? [],
      this.extras.ratings?.listByRatedUser(userId) ?? [],
    ]);
    const account = session?.id === userId ? session : null;

    const preferences: ExportedUserPreferences | null = storedPreferences
      ? {
          phone: storedPreferences.phone,
          neighborhood: storedPreferences.neighborhood,
          pushToken: storedPreferences.pushToken ?? undefined,
          mutedTypes: storedPreferences.mutedTypes ? [...storedPreferences.mutedTypes] : [],
        }
      : null;

    const blockedUsers: ExportedBlockedUser[] = blockedList.map((item) => ({
      blockedId: item.userId,
      createdAt: item.blockedAt,
    }));

    const hiddenConversations: ExportedHiddenConversation[] = Object.entries(hiddenMap).map(([requestId, hiddenAt]) => ({
      requestId,
      hiddenAt,
    }));

    return {
      userId,
      exportedAt: new Date().toISOString(),
      account,
      profile: profile
        ? {
            name: profile.name,
            joinedAt: profile.joinedAt,
            photoUrl: profile.photoUrl,
            socialHandle: profile.socialHandle,
          }
        : null,
      preferences,
      listings: userListings,
      sentRequests,
      receivedRequests,
      negotiationMessages,
      meetings: meetings.map((item) => ({ ...item })),
      deliveries,
      favorites: favoriteIds,
      searchAlerts,
      searchHistory: [],
      notifications: notifications.map((item) => ({ ...item })),
      reports: reports.map((item) => ({ ...item })),
      userReports: userReports.map((item) => ({ ...item })),
      blockedUsers,
      hiddenConversations,
      ratingsGiven: ratingsGiven.map((item) => ({ ...item })),
      ratingsReceived: ratingsReceived.map((item) => ({ ...item })),
    };
  }
}
