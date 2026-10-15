import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { SupabaseBookDataSource } from "@/infra/datasources/supabaseBookDataSource";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { SupabaseNotificationDataSource } from "@/infra/datasources/supabaseNotificationDataSource";
import { SupabaseReportDataSource } from "@/infra/datasources/supabaseReportDataSource";
import { createSupabaseAppClient } from "@/infra/supabaseClient";
import type { IAuthDataSource } from "@/model/datasources/iAuthDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { IReportDataSource } from "@/model/datasources/iReportDataSource";
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

function createDataSources(): {
  auth: IAuthDataSource;
  books: IBookDataSource;
  requests: IBookRequestDataSource;
  reports: IReportDataSource;
  notifications: INotificationDataSource;
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
    };
  }
  const books = new MemoryBookDataSource();
  return {
    auth: new MemoryAuthDataSource(),
    books,
    requests: new MemoryBookRequestDataSource(),
    reports: new MemoryReportDataSource(),
    notifications: new MemoryNotificationDataSource(),
  };
}

const dataSources = createDataSources();
const bookDataSource = dataSources.books;

export const bookUseCases: IBookUseCases = new BookUseCases(bookDataSource);

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
