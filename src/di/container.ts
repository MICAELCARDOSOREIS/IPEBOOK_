import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { SupabaseBookDataSource } from "@/infra/datasources/supabaseBookDataSource";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { SupabaseNotificationDataSource } from "@/infra/datasources/supabaseNotificationDataSource";
import { SupabaseReportDataSource } from "@/infra/datasources/supabaseReportDataSource";
import { SupabaseFavoriteDataSource } from "@/infra/datasources/supabaseFavoriteDataSource";
import { SupabaseSearchAlertDataSource } from "@/infra/datasources/supabaseSearchAlertDataSource";
import { createSupabaseAppClient } from "@/infra/supabaseClient";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
import type { IFavoriteDataSource } from "@/model/datasources/iFavoriteDataSource";
import type { ISearchAlertDataSource } from "@/model/datasources/iSearchAlertDataSource";
import { DataSourceError } from "@/model/errors";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import type { IBookRequestUseCases } from "@/usecase/iBookRequestUseCases";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";
import type { IReportUseCases } from "@/usecase/iReportUseCases";
import { NotificationUseCases } from "@/usecase/notificationUseCases";
import { ReportUseCases } from "@/usecase/reportUseCases";
import { FavoriteUseCases } from "@/usecase/favoriteUseCases";
import { SearchAlertUseCases } from "@/usecase/searchAlertUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import { AsyncStorageOnboardingDataSource } from "@/infra/datasources/asyncStorageOnboardingDataSource";
import { MemoryOnboardingDataSource } from "@/infra/datasources/memoryOnboardingDataSource";
import type { IOnboardingUseCases } from "@/usecase/iOnboardingUseCases";
import { OnboardingUseCases } from "@/usecase/onboardingUseCases";

function createDataSources(): {
  auth: IAuthDataSource;
  books: IBookDataSource;
  requests: IBookRequestDataSource;
  reports: IReportDataSource;
  notifications: INotificationDataSource;
  favorites: IFavoriteDataSource;
  searchAlerts: ISearchAlertDataSource;
} {
  if (process.env.NODE_ENV !== "test" && process.env.EXPO_PUBLIC_BACKEND === "supabase") {
    const redirectUrl = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL;
    if (!redirectUrl) throw new DataSourceError("Configure o retorno da recuperação de senha.");
    const client = createSupabaseAppClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    );
    return {
      auth: new SupabaseAuthDataSource(client, redirectUrl),
      books: new SupabaseBookDataSource(client),
      requests: new SupabaseBookRequestDataSource(client),
      reports: new SupabaseReportDataSource(client),
      notifications: new SupabaseNotificationDataSource(client),
      favorites: new SupabaseFavoriteDataSource(client),
      searchAlerts: new SupabaseSearchAlertDataSource(client),
    };
  }
  const books = new MemoryBookDataSource();
  const notifications = new MemoryNotificationDataSource();
  return {
    auth: new MemoryAuthDataSource(),
    books,
    requests: new MemoryBookRequestDataSource(),
    reports: new MemoryReportDataSource(),
    notifications,
    favorites: new MemoryFavoriteDataSource(),
    searchAlerts: new MemorySearchAlertDataSource(notifications),
  };
}

const dataSources = createDataSources();
const bookDataSource = dataSources.books;

export const onboardingUseCases: IOnboardingUseCases = new OnboardingUseCases(
  process.env.NODE_ENV === "test" ? new MemoryOnboardingDataSource() : new AsyncStorageOnboardingDataSource(),
);
export const searchAlertUseCases: ISearchAlertUseCases = new SearchAlertUseCases(dataSources.searchAlerts);
export const favoriteUseCases: IFavoriteUseCases = new FavoriteUseCases(dataSources.favorites, bookDataSource);
export const bookUseCases: IBookUseCases = new BookUseCases(bookDataSource, searchAlertUseCases);

export const authUseCases: IAuthUseCases = new AuthUseCases(
  dataSources.auth,
);

export const bookRequestUseCases: IBookRequestUseCases = new BookRequestUseCases(
  bookDataSource,
  dataSources.requests,
);

export const reportUseCases: IReportUseCases = new ReportUseCases(
  dataSources.reports,
);

export const notificationUseCases: INotificationUseCases = new NotificationUseCases(
  dataSources.notifications,
);
