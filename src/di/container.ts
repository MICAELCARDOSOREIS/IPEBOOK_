import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryDeliveryDataSource } from "@/infra/datasources/memoryDeliveryDataSource";
import { MemoryMeetingDataSource } from "@/infra/datasources/memoryMeetingDataSource";
import { MemoryNetworkStatusDataSource } from "@/infra/datasources/memoryNetworkStatusDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { MemoryUserPreferencesDataSource } from "@/infra/datasources/memoryUserPreferencesDataSource";
import { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { MemorySearchHistoryDataSource } from "@/infra/datasources/memorySearchHistoryDataSource";
import { AsyncStorageSearchHistoryDataSource } from "@/infra/datasources/asyncStorageSearchHistoryDataSource";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { SupabaseBookDataSource } from "@/infra/datasources/supabaseBookDataSource";
import { CachedBookDataSource } from "@/infra/datasources/cachedBookDataSource";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { SupabaseDeliveryDataSource } from "@/infra/datasources/supabaseDeliveryDataSource";
import { SupabaseMeetingDataSource } from "@/infra/datasources/supabaseMeetingDataSource";
import { SupabaseNotificationDataSource } from "@/infra/datasources/supabaseNotificationDataSource";
import { SupabaseProfileDataSource } from "@/infra/datasources/supabaseProfileDataSource";
import { SupabaseUserPreferencesDataSource } from "@/infra/datasources/supabaseUserPreferencesDataSource";
import { SupabaseRatingDataSource } from "@/infra/datasources/supabaseRatingDataSource";
import { SupabaseReportDataSource } from "@/infra/datasources/supabaseReportDataSource";
import { SupabaseFavoriteDataSource } from "@/infra/datasources/supabaseFavoriteDataSource";
import { SupabaseSearchAlertDataSource } from "@/infra/datasources/supabaseSearchAlertDataSource";
import { createSupabaseAppClient } from "@/infra/supabaseClient";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { IDeliveryDataSource } from "@/model/datasources/iDeliveryDataSource";
import type { IMeetingDataSource } from "@/model/datasources/iMeetingDataSource";
import type { INetworkStatusDataSource } from "@/model/datasources/iNetworkStatusDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { IProfileDataSource } from "@/model/datasources/iProfileDataSource";
import type { IUserPreferencesDataSource } from "@/model/datasources/iUserPreferencesDataSource";
import type { IRatingDataSource } from "@/model/datasources/iRatingDataSource";
import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import type { ISearchHistoryDataSource } from "@/model/datasources/iSearchHistoryDataSource";
import { DataSourceError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import { DeliveryUseCases } from "@/usecase/deliveryUseCases";
import type { IDeliveryUseCases } from "@/usecase/iDeliveryUseCases";
import { MeetingUseCases } from "@/usecase/meetingUseCases";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import type { IPublicProfileUseCases } from "@/usecase/iPublicProfileUseCases";
import type { IRatingUseCases } from "@/usecase/iRatingUseCases";
import { RatingUseCases } from "@/usecase/ratingUseCases";
import type { IReportUseCases } from "@/usecase/iReportUseCases";
import { NotificationUseCases } from "@/usecase/notificationUseCases";
import { PublicProfileUseCases } from "@/usecase/publicProfileUseCases";
import { ReportUseCases } from "@/usecase/reportUseCases";
import { FavoriteUseCases } from "@/usecase/favoriteUseCases";
import { ShareUseCases } from "@/usecase/shareUseCases";
import { SearchAlertUseCases } from "@/usecase/searchAlertUseCases";
import { SearchHistoryUseCases } from "@/usecase/searchHistoryUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { INITIAL_DEV_BOOKS } from "@/di/seedBooks";
import { AsyncStorageOnboardingDataSource } from "@/infra/datasources/asyncStorageOnboardingDataSource";
import { AsyncStorageThemePreferenceDataSource } from "@/infra/datasources/asyncStorageThemePreferenceDataSource";
import { AsyncStorageLocalCacheDataSource } from "@/infra/datasources/asyncStorageLocalCacheDataSource";
import { MemoryOnboardingDataSource } from "@/infra/datasources/memoryOnboardingDataSource";
import { MemoryThemePreferenceDataSource } from "@/infra/datasources/memoryThemePreferenceDataSource";
import { MemoryLocalCacheDataSource } from "@/infra/datasources/memoryLocalCacheDataSource";
import { NetInfoNetworkStatusDataSource } from "@/infra/datasources/netInfoNetworkStatusDataSource";
import { SupabasePhotoStorageDataSource } from "@/infra/datasources/supabasePhotoStorageDataSource";
import { MemoryPhotoStorageDataSource } from "@/infra/datasources/memoryPhotoStorageDataSource";
import { MemoryUserDataExportDataSource } from "@/infra/datasources/memoryUserDataExportDataSource";
import { SupabaseUserDataExportDataSource } from "@/infra/datasources/supabaseUserDataExportDataSource";
import type { IPhotoStorageDataSource } from "@/model/datasources/iPhotoStorageDataSource";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { ILogger } from "@/model/services/iLogger";
import { SafeLogger } from "@/infra/services/safeLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import { ClientRateLimiter } from "@/infra/services/clientRateLimiter";
import type { IFileDownloadService } from "@/model/services/iFileDownloadService";
import { FileDownloadService } from "@/infra/services/fileDownloadService";
import type { IPwaService } from "@/model/services/iPwaService";
import { PwaService } from "@/infra/services/pwaService";
import type { IOnboardingUseCases } from "@/usecase/iOnboardingUseCases";
import type { IThemePreferenceUseCases } from "@/usecase/iThemePreferenceUseCases";
import type { IUserDataExportUseCases } from "@/usecase/iUserDataExportUseCases";
import type { IUserPreferencesUseCases } from "@/usecase/iUserPreferencesUseCases";
import { OnboardingUseCases } from "@/usecase/onboardingUseCases";
import type { IBlockedUserDataSource } from "@/model/datasources/iBlockedUserDataSource";
import type { IBlockedUserUseCases } from "@/usecase/iBlockedUserUseCases";
import { BlockedUserUseCases } from "@/usecase/blockedUserUseCases";
import { MemoryBlockedUserDataSource } from "@/infra/datasources/memoryBlockedUserDataSource";
import { SupabaseBlockedUserDataSource } from "@/infra/datasources/supabaseBlockedUserDataSource";
import type { IMessageDataSource } from "@/model/datasources/iMessageDataSource";
import { MemoryMessageDataSource } from "@/infra/datasources/memoryMessageDataSource";
import { SupabaseMessageDataSource } from "@/infra/datasources/supabaseMessageDataSource";
import { ThemePreferenceUseCases } from "@/usecase/themePreferenceUseCases";
import type { ILocalCacheUseCases } from "@/usecase/iLocalCacheUseCases";
import { LocalCacheUseCases } from "@/usecase/localCacheUseCases";
import { UserDataExportUseCases } from "@/usecase/userDataExportUseCases";
import { UserPreferencesUseCases } from "@/usecase/userPreferencesUseCases";

function createDataSources(): {
  auth: IAuthDataSource;
  books: IBookDataSource;
  requests: IBookRequestDataSource;
  meetings: IMeetingDataSource;
  deliveries: IDeliveryDataSource;
  reports: IReportDataSource;
  notifications: INotificationDataSource;
  favorites: IFavoriteDataSource;
  searchAlerts: ISearchAlertDataSource;
  searchHistory: ISearchHistoryDataSource;
  profiles: IProfileDataSource;
  ratings: IRatingDataSource;
  userDataExport: IUserDataExportDataSource;
  userPreferences: IUserPreferencesDataSource;
  blockedUsers: IBlockedUserDataSource;
  messages: IMessageDataSource;
  photos: IPhotoStorageDataSource;
} {
  const searchHistory = process.env.NODE_ENV === "test"
    ? new MemorySearchHistoryDataSource()
    : new AsyncStorageSearchHistoryDataSource();
  if (process.env.NODE_ENV !== "test" && process.env.EXPO_PUBLIC_BACKEND === "supabase") {
    const redirectUrl = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
    if (!redirectUrl) throw new DataSourceError("Configure o retorno da recuperação de senha.");
    const client = createSupabaseAppClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
    );
    return {
      auth: new SupabaseAuthDataSource(client, redirectUrl),
      books: new CachedBookDataSource(new SupabaseBookDataSource(client)),
      requests: new SupabaseBookRequestDataSource(client),
      meetings: new SupabaseMeetingDataSource(client),
      deliveries: new SupabaseDeliveryDataSource(client),
      reports: new SupabaseReportDataSource(client),
      notifications: new SupabaseNotificationDataSource(client),
      favorites: new SupabaseFavoriteDataSource(client),
      searchAlerts: new SupabaseSearchAlertDataSource(client),
      searchHistory,
      profiles: new SupabaseProfileDataSource(client),
      ratings: new SupabaseRatingDataSource(client),
      userDataExport: new SupabaseUserDataExportDataSource(client),
      userPreferences: new SupabaseUserPreferencesDataSource(client),
      blockedUsers: new SupabaseBlockedUserDataSource(client, new SupabaseProfileDataSource(client)),
      messages: new SupabaseMessageDataSource(client),
      photos: new SupabasePhotoStorageDataSource(client),
    };
  }
  const initialBooks = process.env.NODE_ENV === "test" ? [] : INITIAL_DEV_BOOKS;
  const books = new MemoryBookDataSource(initialBooks);
  const notifications = new MemoryNotificationDataSource();
  const requests = new MemoryBookRequestDataSource();
  const favorites = new MemoryFavoriteDataSource();
  const searchAlerts = new MemorySearchAlertDataSource(notifications);
  const reports = new MemoryReportDataSource();
  const profiles = new MemoryProfileDataSource();
  const auth = new MemoryAuthDataSource();
  const ratings = new MemoryRatingDataSource();
  const blockedUsers = new MemoryBlockedUserDataSource([], profiles);
  return {
    auth,
    books,
    requests,
    meetings: new MemoryMeetingDataSource(requests, books, notifications),
    deliveries: new MemoryDeliveryDataSource(requests, books, notifications),
    reports,
    notifications,
    favorites,
    searchAlerts,
    searchHistory,
    profiles,
    ratings,
    userDataExport: new MemoryUserDataExportDataSource(books, requests, favorites, searchAlerts, {
      auth, profiles, notifications, reports, ratings,
    }),
    userPreferences: new MemoryUserPreferencesDataSource(),
    blockedUsers,
    messages: new MemoryMessageDataSource(),
    photos: new MemoryPhotoStorageDataSource(),
  };
}

const dataSources = createDataSources();
const bookDataSource = dataSources.books;

export const onboardingUseCases: IOnboardingUseCases = new OnboardingUseCases(
  process.env.NODE_ENV === "test" ? new MemoryOnboardingDataSource() : new AsyncStorageOnboardingDataSource(),
);
export const themePreferenceUseCases: IThemePreferenceUseCases = new ThemePreferenceUseCases(
  process.env.NODE_ENV === "test" ? new MemoryThemePreferenceDataSource() : new AsyncStorageThemePreferenceDataSource(),
);
export const localCacheUseCases: ILocalCacheUseCases = new LocalCacheUseCases(
  process.env.NODE_ENV === "test" ? new MemoryLocalCacheDataSource() : new AsyncStorageLocalCacheDataSource(),
);
export const networkStatusDataSource: INetworkStatusDataSource =
  process.env.NODE_ENV === "test" ? new MemoryNetworkStatusDataSource() : new NetInfoNetworkStatusDataSource();
export const searchAlertUseCases: ISearchAlertUseCases = new SearchAlertUseCases(dataSources.searchAlerts);
export const searchHistoryUseCases: ISearchHistoryUseCases = new SearchHistoryUseCases(dataSources.searchHistory);
export const favoriteUseCases: IFavoriteUseCases = new FavoriteUseCases(dataSources.favorites, bookDataSource);
export const shareUseCases: IShareUseCases = new ShareUseCases();
export const bookUseCases: IBookUseCases = new BookUseCases(bookDataSource, searchAlertUseCases);

export const authUseCases: IAuthUseCases = new AuthUseCases(
  dataSources.auth,
  dataSources.profiles,
);

export const bookRequestUseCases: IBookRequestUseCases = new BookRequestUseCases(
  bookDataSource,
  dataSources.requests,
  dataSources.profiles,
);

export const meetingUseCases: IMeetingUseCases = new MeetingUseCases(
  dataSources.meetings,
  dataSources.requests,
  bookDataSource,
);

export const deliveryUseCases: IDeliveryUseCases = new DeliveryUseCases(
  dataSources.deliveries,
  dataSources.requests,
  bookDataSource,
  dataSources.meetings,
);

export const reportUseCases: IReportUseCases = new ReportUseCases(
  dataSources.reports,
);

export const notificationUseCases: INotificationUseCases = new NotificationUseCases(
  dataSources.notifications,
);

export const publicProfileUseCases: IPublicProfileUseCases = new PublicProfileUseCases(
  dataSources.profiles,
  dataSources.ratings,
  bookDataSource,
  dataSources.requests,
);

export const ratingUseCases: IRatingUseCases = new RatingUseCases(
  dataSources.ratings,
  dataSources.profiles,
);

export const userDataExportUseCases: IUserDataExportUseCases = new UserDataExportUseCases(
  dataSources.userDataExport,
  searchHistoryUseCases,
);

export const userPreferencesUseCases: IUserPreferencesUseCases = new UserPreferencesUseCases(
  dataSources.userPreferences,
);

export const blockedUserUseCases: IBlockedUserUseCases = new BlockedUserUseCases(
  dataSources.blockedUsers,
);

import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import {
  getNegotiationMessages,
  sendNegotiationMessage,
  type MessageUseCaseContext,
  type SendMessageParams,
} from "@/model/usecases/messageUseCases";

export const messageDataSource = dataSources.messages;
export const messageUseCaseContext: MessageUseCaseContext = {
  messageDataSource: dataSources.messages,
  bookRequestDataSource: dataSources.requests,
  bookDataSource,
  blockedUserDataSource: dataSources.blockedUsers,
};

export const negotiationMessageUseCases = {
  getMessages: (requestId: string, sessionUserId: string) =>
    getNegotiationMessages(requestId, sessionUserId, messageUseCaseContext),
  sendMessage: (params: SendMessageParams) =>
    sendNegotiationMessage(params, messageUseCaseContext),
  subscribeToMessages: (requestId: string, onMessage: (msg: NegotiationMessage) => void) =>
    messageDataSource.subscribeToMessages?.(requestId, onMessage) ?? (() => {}),
  subscribeToAllMessages: (onMessage: (msg: NegotiationMessage) => void) =>
    messageDataSource.subscribeToAllMessages?.(onMessage) ?? (() => {}),
  hideConversation: async (requestId: string, userId: string) => {
    await messageDataSource.hideConversation?.(requestId, userId);
  },
  listHiddenConversations: async (userId: string) => (await messageDataSource.listHiddenConversations?.(userId)) ?? {},
};

export const logger: ILogger = new SafeLogger(
  process.env.NODE_ENV === "test" ? { sink: () => {} } : {}
);

export const rateLimiter: IRateLimiter = new ClientRateLimiter();

export const fileDownloadService: IFileDownloadService = new FileDownloadService();

export const pwaService: IPwaService = new PwaService(logger);

import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import { MemoryBookMetadataService } from "@/infra/services/memoryBookMetadataService";
import { OpenLibraryBookMetadataService } from "@/infra/services/openLibraryBookMetadataService";
import { GoogleBooksBookMetadataService } from "@/infra/services/googleBooksBookMetadataService";
import { CompositeBookMetadataService } from "@/infra/services/compositeBookMetadataService";

export const bookMetadataService: IBookMetadataService =
  process.env.NODE_ENV !== "test" && process.env.EXPO_PUBLIC_BACKEND === "supabase"
    ? new CompositeBookMetadataService([new OpenLibraryBookMetadataService(), new GoogleBooksBookMetadataService()])
    : new MemoryBookMetadataService();

import type { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { MemoryPushNotificationService } from "@/infra/services/memoryPushNotificationService";
import { ExpoPushNotificationService } from "@/infra/services/expoPushNotificationService";

export const pushNotificationService: IPushNotificationService =
  process.env.NODE_ENV !== "test"
    ? new ExpoPushNotificationService(logger)
    : new MemoryPushNotificationService();

import type { IImagePickerService } from "@/model/services/iImagePickerService";
import { ExpoImagePickerService } from "@/infra/services/expoImagePickerService";
import { MemoryImagePickerService } from "@/infra/services/memoryImagePickerService";
import type { IProfilePhotoUseCases } from "@/usecase/iProfilePhotoUseCases";
import type { IListingPhotoUseCases } from "@/usecase/iListingPhotoUseCases";
import { ListingPhotoUseCases } from "@/usecase/listingPhotoUseCases";
import { ProfilePhotoUseCases } from "@/usecase/profilePhotoUseCases";

/** Foto de perfil pela câmera ou galeria (ADR 0065). */
export const imagePickerService: IImagePickerService =
  process.env.NODE_ENV !== "test" ? new ExpoImagePickerService() : new MemoryImagePickerService();

export const profilePhotoUseCases: IProfilePhotoUseCases = new ProfilePhotoUseCases(dataSources.photos);
export const listingPhotoUseCases: IListingPhotoUseCases = new ListingPhotoUseCases(dataSources.photos);
