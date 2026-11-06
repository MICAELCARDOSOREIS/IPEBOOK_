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
import { SafeLogger, reportingSink } from "@/infra/services/safeLogger";
import { MemoryErrorReporter } from "@/infra/services/memoryErrorReporter";
import { SentryErrorReporter } from "@/infra/services/sentryErrorReporter";
import type { IErrorReporter } from "@/model/services/iErrorReporter";
import { GoogleNativeSignInService } from "@/infra/services/googleNativeSignInService";
import type { IStoreReviewService } from "@/model/services/iStoreReviewService";
import { ExpoStoreReviewService } from "@/infra/services/expoStoreReviewService";
import { MemoryStoreReviewService } from "@/infra/services/memoryStoreReviewService";
import Constants from "expo-constants";
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
import type { IModerationDataSource } from "@/model/datasources/iModerationDataSource";
import { MemoryModerationDataSource } from "@/infra/datasources/memoryModerationDataSource";
import { SupabaseModerationDataSource } from "@/infra/datasources/supabaseModerationDataSource";
import type { IModerationUseCases } from "@/usecase/iModerationUseCases";
import { ModerationUseCases } from "@/usecase/moderationUseCases";
import { MemoryBetaTesterDataSource } from "@/infra/datasources/memoryBetaTesterDataSource";
import { SupabaseBetaTesterDataSource } from "@/infra/datasources/supabaseBetaTesterDataSource";
import type { IBetaTesterDataSource } from "@/model/datasources/iBetaTesterDataSource";
import { BetaSignupUseCases } from "@/usecase/betaSignupUseCases";
import type { IBetaSignupUseCases } from "@/usecase/iBetaSignupUseCases";
import { SupabaseAppVersionPolicyDataSource } from "@/infra/datasources/supabaseAppVersionPolicyDataSource";
import { MemoryAppVersionPolicyDataSource } from "@/infra/datasources/memoryAppVersionPolicyDataSource";
import { AsyncStorageAppUpdateDismissDataSource } from "@/infra/datasources/asyncStorageAppUpdateDismissDataSource";
import { MemoryAppUpdateDismissDataSource } from "@/infra/datasources/memoryAppUpdateDismissDataSource";
import { ExpoAppStoreLauncherService } from "@/infra/services/expoAppStoreLauncherService";
import { MemoryAppStoreLauncherService } from "@/infra/services/memoryAppStoreLauncherService";
import { AppUpdateUseCases } from "@/usecase/appUpdateUseCases";
import { useAppUpdateViewModel } from "@/viewmodel/useAppUpdateViewModel";

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
  moderation: IModerationDataSource;
  betaTesters: IBetaTesterDataSource;
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
      auth: new SupabaseAuthDataSource(
        client,
        redirectUrl,
        new GoogleNativeSignInService(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
      ),
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
      moderation: new SupabaseModerationDataSource(client),
      betaTesters: new SupabaseBetaTesterDataSource(client),
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
    moderation: new MemoryModerationDataSource(),
    betaTesters: new MemoryBetaTesterDataSource(),
  };
}

const dataSources = createDataSources();
const bookDataSource = dataSources.books;

const appUpdatePolicyDataSource =
  process.env.NODE_ENV !== "test" && process.env.EXPO_PUBLIC_BACKEND === "supabase"
    ? new SupabaseAppVersionPolicyDataSource(
        createSupabaseAppClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
          process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_KEY ?? "",
        ),
      )
    : new MemoryAppVersionPolicyDataSource();
export const appUpdateUseCases = new AppUpdateUseCases(
  appUpdatePolicyDataSource,
  process.env.NODE_ENV === "test"
    ? new MemoryAppUpdateDismissDataSource()
    : new AsyncStorageAppUpdateDismissDataSource(),
  process.env.NODE_ENV === "test" ? new MemoryAppStoreLauncherService() : new ExpoAppStoreLauncherService(),
  Constants.expoConfig?.version ?? "0.0.0",
);

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

export const betaSignupUseCases: IBetaSignupUseCases = new BetaSignupUseCases(dataSources.betaTesters);

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

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
/** Sem chave do Sentry (ou em teste) os erros ficam só no aparelho (Spec 104 / ADR 0080). */
export const errorReporter: IErrorReporter =
  process.env.NODE_ENV !== "test" && sentryDsn
    ? new SentryErrorReporter({
        dsn: sentryDsn,
        environment: process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production"),
        release: Constants.expoConfig?.version,
      })
    : new MemoryErrorReporter();

export const logger: ILogger = new SafeLogger(
  process.env.NODE_ENV === "test"
    ? { sink: () => {} }
    : { sink: reportingSink(errorReporter) },
);

export const rateLimiter: IRateLimiter = new ClientRateLimiter();

export const fileDownloadService: IFileDownloadService = new FileDownloadService();

export const pwaService: IPwaService = new PwaService(logger);

import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import { MemoryBookMetadataService } from "@/infra/services/memoryBookMetadataService";
import { OpenLibraryBookMetadataService } from "@/infra/services/openLibraryBookMetadataService";
import { GoogleBooksBookMetadataService } from "@/infra/services/googleBooksBookMetadataService";
import { CompositeBookMetadataService } from "@/infra/services/compositeBookMetadataService";
import { BrasilApiBookMetadataService } from "@/infra/services/brasilApiBookMetadataService";

export const bookMetadataService: IBookMetadataService =
  process.env.NODE_ENV !== "test" && process.env.EXPO_PUBLIC_BACKEND === "supabase"
    ? new CompositeBookMetadataService([
        new OpenLibraryBookMetadataService(),
        new GoogleBooksBookMetadataService(),
        new BrasilApiBookMetadataService(),
      ])
    : new MemoryBookMetadataService();

import type { IPushNotificationService } from "@/model/services/iPushNotificationService";
import { MemoryPushNotificationService } from "@/infra/services/memoryPushNotificationService";
import { ExpoPushNotificationService } from "@/infra/services/expoPushNotificationService";

export const pushNotificationService: IPushNotificationService =
  process.env.NODE_ENV !== "test"
    ? new ExpoPushNotificationService(logger)
    : new MemoryPushNotificationService();

import type { IPermissionService } from "@/model/services/iPermissionService";
import type { IPermissionPromptUseCases } from "@/usecase/iPermissionPromptUseCases";
import { PermissionPromptUseCases } from "@/usecase/permissionPromptUseCases";
import { AsyncStoragePermissionAskDataSource } from "@/infra/datasources/asyncStoragePermissionAskDataSource";
import { MemoryPermissionAskDataSource } from "@/infra/datasources/memoryPermissionAskDataSource";

/** Permissão de notificação do aparelho vista pelo prompt da Spec 020 (o serviço do push já sabe consultar e pedir). */
const notificationsPermissionService: IPermissionService = {
  isGranted: () => pushNotificationService.getPermissions(),
  request: () => pushNotificationService.requestPermissions(),
};
export const notificationsPermissionPromptUseCases: IPermissionPromptUseCases = new PermissionPromptUseCases(
  notificationsPermissionService,
  process.env.NODE_ENV === "test"
    ? new MemoryPermissionAskDataSource()
    : new AsyncStoragePermissionAskDataSource("notifications"),
);

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

export const moderationUseCases: IModerationUseCases = new ModerationUseCases(dataSources.moderation);

export const storeReviewService: IStoreReviewService =
  process.env.NODE_ENV === "test" ? new MemoryStoreReviewService() : new ExpoStoreReviewService();

// Spec 126 / ADR 0098: fábricas de ViewModel. O ViewModel recebe as dependências por parâmetro e a
// composição fica aqui; a View chama a fábrica e nenhum arquivo de src/viewmodel/ importa o container.
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";
import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";

/** Lote catálogo (T004): início, busca, favoritos e alertas. */
export const makeHomeViewModel = () => useHomeViewModel(bookUseCases);
export const makeSearchViewModel = (userId: string | null) =>
  useSearchViewModel(userId, bookUseCases, searchHistoryUseCases);
export const makeFavoritesViewModel = (userId: string | null) => useFavoritesViewModel(userId, favoriteUseCases);
export const makeFavoriteButtonViewModel = (bookId: string, userId: string | null) =>
  useFavoriteButtonViewModel(bookId, userId, favoriteUseCases);
export const makeSearchAlertsViewModel = (userId: string | null, initialQuery = "") =>
  useSearchAlertsViewModel(userId, initialQuery, searchAlertUseCases);
export const makeWelcomeGateViewModel = () => useWelcomeGateViewModel(onboardingUseCases);
export const makeAppUpdateViewModel = () => useAppUpdateViewModel(appUpdateUseCases);

import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";
import { useEditListingViewModel } from "@/viewmodel/useEditListingViewModel";
import { useListingPhotoViewModel } from "@/viewmodel/useListingPhotoViewModel";
import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { useShareListingViewModel } from "@/viewmodel/useShareListingViewModel";

/** Lote anúncios (T005): criar, editar, gerenciar, rascunhos, detalhe, foto, estante, perfil público e compartilhamento. */
export const makeCreateListingViewModel = () =>
  useCreateListingViewModel(bookUseCases, rateLimiter, logger, bookMetadataService);
export const makeEditListingViewModel = (bookId: string, sessionUserId: string | null) =>
  useEditListingViewModel(bookId, sessionUserId, bookUseCases);
export const makeManageListingViewModel = (bookId: string, sessionUserId: string | null) =>
  useManageListingViewModel(bookId, sessionUserId, bookUseCases);
export const makeDraftsViewModel = (sessionUserId: string | null) => useDraftsViewModel(sessionUserId, bookUseCases);
export const makeBookDetailViewModel = (bookId: string, userId: string | null = null) =>
  useBookDetailViewModel(bookId, bookUseCases, favoriteUseCases, userId);
export const makeListingPhotoViewModel = (sessionUserId: string | null) =>
  useListingPhotoViewModel(sessionUserId, imagePickerService, listingPhotoUseCases);
export const makeMyListingsViewModel = (sessionUserId: string | null) =>
  useMyListingsViewModel(sessionUserId, bookUseCases);
export const makePublicProfileViewModel = (userId: string) =>
  usePublicProfileViewModel(userId, publicProfileUseCases);
export const makeShareListingViewModel = () => useShareListingViewModel(shareUseCases);

import { useDeliveryStatus, useDeliveryViewModel } from "@/viewmodel/useDeliveryViewModel";
import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { useReceivedRequestsViewModel } from "@/viewmodel/useReceivedRequestsViewModel";
import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useRequestNegotiationViewModel } from "@/viewmodel/useRequestNegotiationViewModel";
import { useScheduleMeetingViewModel } from "@/viewmodel/useScheduleMeetingViewModel";
import { useSentRequestsViewModel } from "@/viewmodel/useSentRequestsViewModel";
import { useUserMeetingsViewModel } from "@/viewmodel/useUserMeetingsViewModel";

/** Lote pedidos, encontro e entrega (T006). */
export const makeRequestNegotiationViewModel = () => useRequestNegotiationViewModel(bookRequestUseCases);
export const makeReceivedRequestsViewModel = (sessionUserId: string | null) =>
  useReceivedRequestsViewModel(sessionUserId, bookRequestUseCases);
export const makeSentRequestsViewModel = (sessionUserId: string | null) =>
  useSentRequestsViewModel(sessionUserId, bookRequestUseCases);
export const makeRequestDetailViewModel = (requestId: string, sessionUserId: string | null) =>
  useRequestDetailViewModel(requestId, sessionUserId, bookRequestUseCases);
export const makeMeetingViewModel = (requestId: string, sessionUserId: string | null) =>
  useMeetingViewModel(requestId, sessionUserId, meetingUseCases, rateLimiter, logger);
export const makeScheduleMeetingViewModel = (requestId: string, sessionUserId: string | null) =>
  useScheduleMeetingViewModel(requestId, sessionUserId, meetingUseCases, undefined, rateLimiter, logger);
export const makeUserMeetingsViewModel = (sessionUserId: string | null) =>
  useUserMeetingsViewModel(sessionUserId, meetingUseCases);
export const makeDeliveryViewModel = (requestId: string, sessionUserId: string | null) =>
  useDeliveryViewModel(requestId, sessionUserId, deliveryUseCases);
export const makeDeliveryStatus = (
  requestId: string,
  sessionUserId: string | null,
  refreshKey = 0,
) => useDeliveryStatus(requestId, sessionUserId, refreshKey, deliveryUseCases);

import { useChatWithUser, type ChatWithUserDeps } from "@/viewmodel/useChatWithUser";
import { useConversationsViewModel, type ConversationsDeps } from "@/viewmodel/useConversationsViewModel";
import { useNavigationBadgesViewModel, type NavigationBadgesDeps } from "@/viewmodel/useNavigationBadgesViewModel";
import { useNegotiationChatViewModel } from "@/viewmodel/useNegotiationChatViewModel";
import { useNegotiationRatingViewModel } from "@/viewmodel/useNegotiationRatingViewModel";
import { useNotificationPreferencesViewModel } from "@/viewmodel/useNotificationPreferencesViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";
import { usePushRegistration } from "@/viewmodel/usePushRegistration";
import { usePermissionPromptViewModel } from "@/viewmodel/usePermissionPromptViewModel";
import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";

const defaultConversationsDeps: ConversationsDeps = {
  listSentRequests: (id) => bookRequestUseCases.listSentRequests(id),
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
  getMessages: (requestId, sessionUserId) => negotiationMessageUseCases.getMessages(requestId, sessionUserId),
  hideConversation: (requestId, userId) => negotiationMessageUseCases.hideConversation(requestId, userId),
  listHiddenConversations: (userId) => negotiationMessageUseCases.listHiddenConversations(userId),
  cancelRequest: (requestId, userId) => bookRequestUseCases.cancelRequest(requestId, userId),
  getProfile: async (userId) => {
    const profile = await publicProfileUseCases.getPublicProfile(userId);
    return { name: profile.name ?? null, photoUrl: profile.photoUrl ?? null };
  },
  subscribe: (sessionUserId, onChange) => {
    const offMessages = negotiationMessageUseCases.subscribeToAllMessages(() => onChange());
    const offNotifications = notificationUseCases.subscribe?.(sessionUserId, onChange) ?? (() => {});
    return () => {
      offMessages();
      offNotifications();
    };
  },
};

const defaultChatWithUserDeps: ChatWithUserDeps = {
  listSentRequests: (id) => bookRequestUseCases.listSentRequests(id),
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
};

const defaultNavigationBadgesDeps: NavigationBadgesDeps = {
  listReceivedRequests: (id) => bookRequestUseCases.listReceivedRequests(id),
  subscribe: (id, onChange) => notificationUseCases.subscribe?.(id, onChange) ?? (() => {}),
};

/** Lote conversas e notificações (T007). */
export const makeNegotiationChatViewModel = (requestId: string, sessionUserId: string) =>
  useNegotiationChatViewModel(requestId, sessionUserId, negotiationMessageUseCases);
export const makeConversationsViewModel = (sessionUserId: string | null) =>
  useConversationsViewModel(sessionUserId, defaultConversationsDeps);
export const makeChatWithUser = (
  sessionUserId: string | null,
  userId: string,
  onOpenChat: (requestId: string) => void,
) => useChatWithUser(sessionUserId, userId, onOpenChat, defaultChatWithUserDeps);
export const makeNegotiationRatingViewModel = (
  requestId: string,
  sessionUserId: string | null,
  ratedUserId: string,
) => useNegotiationRatingViewModel(requestId, sessionUserId, ratedUserId, ratingUseCases, storeReviewService);
export const makeNavigationBadgesViewModel = (sessionUserId: string | null, refreshKey: string) =>
  useNavigationBadgesViewModel(sessionUserId, refreshKey, defaultNavigationBadgesDeps);
export const makeNotificationsViewModel = (sessionUserId: string | null) =>
  useNotificationsViewModel(sessionUserId, notificationUseCases, pushNotificationService);
export const makeNotificationPreferencesViewModel = (sessionUserId: string | null) =>
  useNotificationPreferencesViewModel(sessionUserId, userPreferencesUseCases);
export const makePushRegistration = (
  sessionUserId: string | null,
  onOpenRoute: (route: string) => void,
  permissionReady: boolean,
) =>
  usePushRegistration(sessionUserId, onOpenRoute, pushNotificationService, userPreferencesUseCases, permissionReady);
/** Prompt de permissão de notificação (Spec 020): explica o motivo antes do aviso nativo, uma vez por aparelho. */
export const makeNotificationsPromptViewModel = () =>
  usePermissionPromptViewModel(notificationsPermissionPromptUseCases);
export const makeReceivedRatingsViewModel = (sessionUserId: string | null) =>
  useReceivedRatingsViewModel(sessionUserId, ratingUseCases);

import { startErrorReporting } from "@/viewmodel/errorReporting";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useBetaSignupViewModel } from "@/viewmodel/useBetaSignupViewModel";
import { useBlockedUsersViewModel } from "@/viewmodel/useBlockedUsersViewModel";
import { useDeleteAccountViewModel } from "@/viewmodel/useDeleteAccountViewModel";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
import { useIsModerator, useModerationViewModel } from "@/viewmodel/useModerationViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
import { useProfilePhotoViewModel } from "@/viewmodel/useProfilePhotoViewModel";
import { useProfileSafetyViewModel, type ProfileSafetyDeps } from "@/viewmodel/useProfileSafetyViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { usePwaViewModel, type UsePwaViewModelOptions } from "@/viewmodel/usePwaViewModel";
import { useReportListingViewModel } from "@/viewmodel/useReportListingViewModel";
import { useReportUserViewModel } from "@/viewmodel/useReportUserViewModel";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";
import { useThemeViewModel } from "@/viewmodel/useThemeViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";

const defaultProfileSafetyDeps: ProfileSafetyDeps = {
  blockUser: (sessionUserId, targetUserId) => blockedUserUseCases.blockUser(sessionUserId, targetUserId),
  listBooks: () => bookUseCases.listBooks(),
};

/** Lote conta, preferências, moderação e relatórios (T008). */
export const makeStartErrorReporting = (reporter: IErrorReporter = errorReporter) =>
  startErrorReporting(reporter);
export const makeAuthViewModel = () => useAuthViewModel(authUseCases, rateLimiter, logger);
export const makeBetaSignupViewModel = () => useBetaSignupViewModel(betaSignupUseCases);
export const makeBlockedUsersViewModel = (sessionUserId: string | null) =>
  useBlockedUsersViewModel(sessionUserId, blockedUserUseCases);
export const makeDeleteAccountViewModel = () =>
  useDeleteAccountViewModel(authUseCases, searchHistoryUseCases, userDataExportUseCases, fileDownloadService);
export const makeInviteFriendsViewModel = () => useInviteFriendsViewModel(shareUseCases);
export const makeModerationViewModel = (sessionUserId: string | null) =>
  useModerationViewModel(sessionUserId, moderationUseCases);
export const makeIsModerator = (sessionUserId: string | null) =>
  useIsModerator(sessionUserId, moderationUseCases);
export const makeNetworkStatus = () => useNetworkStatus(networkStatusDataSource);
export const makeProfilePhotoViewModel = (sessionUserId: string | null) =>
  useProfilePhotoViewModel(sessionUserId, imagePickerService, profilePhotoUseCases);
export const makeProfileSafetyViewModel = (sessionUserId: string | null, targetUserId: string) =>
  useProfileSafetyViewModel(sessionUserId, targetUserId, defaultProfileSafetyDeps);
export const makeProfileViewModel = (userId: string | null) =>
  useProfileViewModel(userId, publicProfileUseCases);
export const makePwaViewModel = (options: Partial<UsePwaViewModelOptions> = {}) =>
  usePwaViewModel({ pwaService: options.pwaService ?? pwaService, autoRegister: options.autoRegister });
export const makeReportListingViewModel = () =>
  useReportListingViewModel(reportUseCases, rateLimiter, logger);
export const makeReportUserViewModel = () => useReportUserViewModel(reportUseCases, rateLimiter);
export const makeResetPasswordViewModel = () => useResetPasswordViewModel(authUseCases);
export const makeSettingsViewModel = () =>
  useSettingsViewModel(localCacheUseCases, searchHistoryUseCases);
export const makeThemeViewModel = () => useThemeViewModel(themePreferenceUseCases);
export const makeUserPreferencesViewModel = (userId: string | null) =>
  useUserPreferencesViewModel(userId, userPreferencesUseCases);
