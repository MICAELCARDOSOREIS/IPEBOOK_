import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import { ALL_ALERT_MODALITIES, type SearchAlert } from "@/model/entities/searchAlert";
import type { UserExportData } from "@/model/entities/userExportData";
import type { AppNotification } from "@/model/entities/notification";
import type { ReportListing } from "@/model/entities/report";
import type { Rating } from "@/model/entities/rating";
import { DataSourceError } from "@/model/errors";

const PAGE_SIZE = 500;

async function fetchAllRows(
  page: (start: number, end: number) => PromiseLike<{ data: any[] | null; error: unknown }>,
  errorMessage: string,
): Promise<any[]> {
  const rows: any[] = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const result = await page(start, start + PAGE_SIZE - 1);
    if (result.error) throw new DataSourceError(errorMessage);
    const batch = result.data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
}

export class SupabaseUserDataExportDataSource implements IUserDataExportDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    try {
      const [accountRes, listingsRows, sentRows, favoriteRows, alertRows, profileRes, notificationRows, reportRows, givenRows, receivedRatingRows] = await Promise.all([
        this.client.auth.getUser(),
        fetchAllRows((start, end) => this.client.from("v2_books").select("*").eq("owner_id", userId).order("id").range(start, end), "Falha ao exportar anúncios do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_book_requests").select("*").eq("requester_id", userId).order("id").range(start, end), "Falha ao exportar pedidos do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_favorites").select("book_id").eq("user_id", userId).order("book_id").range(start, end), "Falha ao exportar favoritos do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_search_alerts").select("*").eq("user_id", userId).order("id").range(start, end), "Falha ao exportar alertas do usuário."),
        this.client.from("v2_profiles").select("*").eq("id", userId).maybeSingle(),
        fetchAllRows((start, end) => this.client.from("v2_notifications").select("*").eq("user_id", userId).order("id").range(start, end), "Falha ao exportar notificações do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_reports").select("*").eq("reporter_id", userId).order("id").range(start, end), "Falha ao exportar denúncias do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_ratings").select("*").eq("rater_id", userId).order("id").range(start, end), "Falha ao exportar avaliações do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_ratings").select("*").eq("rated_user_id", userId).order("id").range(start, end), "Falha ao exportar avaliações do usuário."),
      ]);

      const accountEmail = accountRes.data.user?.email;
      if (accountRes.error || accountRes.data.user?.id !== userId || !accountEmail) {
        throw new DataSourceError("Não foi possível conferir a conta para exportação.");
      }
      if (profileRes.error) throw new DataSourceError("Falha ao exportar perfil do usuário.");

      const listings: Book[] = listingsRows.map((row: any) => ({
        id: row.id,
        ownerId: row.owner_id,
        title: row.title,
        author: row.author,
        modality: row.modality,
        price: row.price,
        status: row.status,
        condition: row.condition,
        description: row.description,
        city: row.city,
        state: row.state,
        neighborhood: row.neighborhood,
        photoUrl: row.photo_url,
        photos: row.photos ?? [],
        category: row.category,
      }));

      const listingIds = listings.map((l) => l.id);
      let receivedRequests: BookRequest[] = [];
      if (listingIds.length > 0) {
        const receivedRows: any[] = [];
        for (let i = 0; i < listingIds.length; i += 100) {
          const ids = listingIds.slice(i, i + 100);
          receivedRows.push(...await fetchAllRows(
            (start, end) => this.client.from("v2_book_requests").select("*").in("listing_id", ids).order("id").range(start, end),
            "Falha ao exportar pedidos recebidos.",
          ));
        }
        receivedRequests = receivedRows.map((row: any) => ({
            id: row.id,
            listingId: row.listing_id,
            requesterId: row.requester_id,
            status: row.status,
            createdAt: row.created_at,
          }));
      }

      const sentRequests: BookRequest[] = sentRows.map((row: any) => ({
        id: row.id,
        listingId: row.listing_id,
        requesterId: row.requester_id,
        status: row.status,
        createdAt: row.created_at,
      }));

      const favorites: string[] = favoriteRows.map((row: any) => row.book_id);

      const searchAlerts: SearchAlert[] = alertRows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        query: row.query,
        active: row.active,
        createdAt: row.created_at,
        modalities: row.modalities?.length ? row.modalities : [...ALL_ALERT_MODALITIES],
      }));

      const notifications: AppNotification[] = notificationRows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: row.read,
        createdAt: row.created_at,
        ...(row.action_url ? { actionUrl: row.action_url } : {}),
      }));
      const reports: ReportListing[] = reportRows.map((row: any) => ({
        id: row.id,
        listingId: row.listing_id,
        reporterId: row.reporter_id,
        reason: row.reason,
        details: row.details ?? undefined,
        createdAt: row.created_at,
      }));
      const mapRating = (row: any): Rating => ({
        id: row.id,
        raterId: row.rater_id,
        ratedUserId: row.rated_user_id,
        requestId: row.request_id,
        score: row.score,
        createdAt: row.created_at,
      });
      const user = accountRes.data.user;

      return {
        userId,
        exportedAt: new Date().toISOString(),
        account: {
          id: user.id,
          email: accountEmail,
          name: typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined,
        },
        profile: profileRes.data ? {
          name: profileRes.data.name,
          joinedAt: profileRes.data.created_at,
          photoUrl: profileRes.data.photo_url ?? undefined,
          socialHandle: profileRes.data.social_handle ?? undefined,
        } : null,
        listings,
        sentRequests,
        receivedRequests,
        favorites,
        searchAlerts,
        searchHistory: [],
        notifications,
        reports,
        ratingsGiven: givenRows.map(mapRating),
        ratingsReceived: receivedRatingRows.map(mapRating),
      };
    } catch (err) {
      if (err instanceof DataSourceError) throw err;
      throw new DataSourceError("Erro inesperado ao exportar dados do usuário.");
    }
  }
}
