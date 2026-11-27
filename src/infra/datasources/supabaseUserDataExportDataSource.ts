import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { Delivery } from "@/model/entities/delivery";
import type { Meeting } from "@/model/entities/meeting";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type { AppNotification } from "@/model/entities/notification";
import type { Rating } from "@/model/entities/rating";
import type { ReportListing, ReportUser } from "@/model/entities/report";
import { ALL_ALERT_MODALITIES, type SearchAlert } from "@/model/entities/searchAlert";
import type {
  ExportedBlockedUser,
  ExportedBook,
  ExportedBookRequest,
  ExportedHiddenConversation,
  ExportedUserPreferences,
  UserExportData,
} from "@/model/entities/userExportData";
import { DataSourceError } from "@/model/errors";

const PAGE_SIZE = 500;
const IN_BATCH_SIZE = 100;

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

async function fetchAllByInBatches(
  ids: readonly string[],
  fetchBatch: (batchIds: readonly string[], start: number, end: number) => PromiseLike<{ data: any[] | null; error: unknown }>,
  errorMessage: string,
): Promise<any[]> {
  if (ids.length === 0) return [];
  const rows: any[] = [];
  for (let i = 0; i < ids.length; i += IN_BATCH_SIZE) {
    const slice = ids.slice(i, i + IN_BATCH_SIZE);
    rows.push(...await fetchAllRows((start, end) => fetchBatch(slice, start, end), errorMessage));
  }
  return rows;
}

function mapBookRow(row: any): ExportedBook {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    author: row.author,
    modality: row.modality,
    price: row.price ?? undefined,
    status: row.status,
    condition: row.condition ?? undefined,
    description: row.description ?? undefined,
    synopsis: row.synopsis ?? undefined,
    publisher: row.publisher ?? undefined,
    pageCount: row.page_count ?? undefined,
    publicationYear: row.publication_year ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    neighborhood: row.neighborhood ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    photos: row.photos ?? [],
    category: row.category ?? undefined,
    isBox: row.is_box ?? undefined,
    boxVolumesCount: row.box_volumes_count ?? undefined,
    draftStep: row.draft_step ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    isbn: row.isbn ?? undefined,
    edition: row.edition ?? undefined,
    moderationHold: row.moderation_hold ?? undefined,
  };
}

function mapRequestRow(row: any): ExportedBookRequest {
  return {
    id: row.id,
    listingId: row.listing_id,
    requesterId: row.requester_id,
    status: row.status,
    createdAt: row.created_at ?? undefined,
    ...(row.initial_message ? { initialMessage: row.initial_message } : {}),
    ...(row.offered_book_id ? { offeredBookId: row.offered_book_id } : {}),
  };
}

export class SupabaseUserDataExportDataSource implements IUserDataExportDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    try {
      const [
        accountRes,
        listingsRows,
        sentRows,
        favoriteRows,
        alertRows,
        profileRes,
        preferencesRes,
        notificationRows,
        reportRows,
        userReportRows,
        blockedRows,
        hiddenConversationRows,
        givenRows,
        receivedRatingRows,
      ] = await Promise.all([
        this.client.auth.getUser(),
        fetchAllRows((start, end) => this.client.from("v2_books").select("*").eq("owner_id", userId).order("id").range(start, end), "Falha ao exportar anúncios do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_book_requests").select("*").eq("requester_id", userId).order("id").range(start, end), "Falha ao exportar pedidos do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_favorites").select("book_id").eq("user_id", userId).order("book_id").range(start, end), "Falha ao exportar favoritos do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_search_alerts").select("*").eq("user_id", userId).order("id").range(start, end), "Falha ao exportar alertas do usuário."),
        this.client.from("v2_profiles").select("*").eq("id", userId).maybeSingle(),
        this.client.from("v2_user_preferences").select("*").eq("user_id", userId).maybeSingle(),
        fetchAllRows((start, end) => this.client.from("v2_notifications").select("*").eq("user_id", userId).order("id").range(start, end), "Falha ao exportar notificações do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_reports").select("*").eq("reporter_id", userId).order("id").range(start, end), "Falha ao exportar denúncias do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_user_reports").select("*").eq("reporter_id", userId).order("id").range(start, end), "Falha ao exportar denúncias de pessoas do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_blocked_users").select("*").eq("blocker_id", userId).order("blocked_id").range(start, end), "Falha ao exportar pessoas bloqueadas pelo usuário."),
        fetchAllRows((start, end) => this.client.from("v2_hidden_conversations").select("*").eq("user_id", userId).order("request_id").range(start, end), "Falha ao exportar conversas ocultas do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_ratings").select("*").eq("rater_id", userId).order("id").range(start, end), "Falha ao exportar avaliações do usuário."),
        fetchAllRows((start, end) => this.client.from("v2_ratings").select("*").eq("rated_user_id", userId).order("id").range(start, end), "Falha ao exportar avaliações do usuário."),
      ]);

      const accountEmail = accountRes.data.user?.email;
      if (accountRes.error || accountRes.data.user?.id !== userId || !accountEmail) {
        throw new DataSourceError("Não foi possível conferir a conta para exportação.");
      }
      if (profileRes.error) throw new DataSourceError("Falha ao exportar perfil do usuário.");
      if (preferencesRes.error) throw new DataSourceError("Falha ao exportar preferências do usuário.");

      const listings: ExportedBook[] = listingsRows.map(mapBookRow);
      const sentRequests: ExportedBookRequest[] = sentRows.map(mapRequestRow);

      const listingIds = listings.map((l) => l.id);
      const receivedRows = await fetchAllByInBatches(
        listingIds,
        (ids, start, end) => this.client.from("v2_book_requests").select("*").in("listing_id", ids).order("id").range(start, end),
        "Falha ao exportar pedidos recebidos.",
      );
      const receivedRequests: ExportedBookRequest[] = receivedRows.map(mapRequestRow);

      const allRequestIds = [...new Set([...sentRequests.map((r) => r.id), ...receivedRequests.map((r) => r.id)])];
      const [messageRows, meetingRows, deliveryRows] = await Promise.all([
        fetchAllByInBatches(
          allRequestIds,
          (ids, start, end) => this.client.from("v2_negotiation_messages").select("*").in("request_id", ids).order("id").range(start, end),
          "Falha ao exportar mensagens de negociação do usuário.",
        ),
        fetchAllByInBatches(
          allRequestIds,
          (ids, start, end) => this.client.from("v2_meetings").select("*").in("request_id", ids).order("id").range(start, end),
          "Falha ao exportar encontros do usuário.",
        ),
        fetchAllByInBatches(
          allRequestIds,
          (ids, start, end) => this.client.from("v2_deliveries").select("*").in("request_id", ids).order("request_id").range(start, end),
          "Falha ao exportar entregas do usuário.",
        ),
      ]);

      const negotiationMessages: NegotiationMessage[] = messageRows.map((row: any) => ({
        id: row.id,
        requestId: row.request_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: row.created_at,
      }));

      const meetings: Meeting[] = meetingRows.map((row: any) => ({
        id: row.id,
        requestId: row.request_id,
        pointName: row.point_name,
        scheduledAt: row.scheduled_at,
        status: row.status,
        proposedBy: row.proposed_by,
        note: row.note ?? undefined,
      }));

      const deliveries: Delivery[] = deliveryRows.map((row: any) => ({
        requestId: row.request_id,
        completedBy: row.completed_by,
        completedAt: row.completed_at,
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

      const userReports: ReportUser[] = userReportRows.map((row: any) => ({
        id: row.id,
        reportedUserId: row.reported_user_id,
        reporterId: row.reporter_id,
        reason: row.reason,
        details: row.details ?? undefined,
        createdAt: row.created_at,
      }));

      const blockedUsers: ExportedBlockedUser[] = blockedRows.map((row: any) => ({
        blockedId: row.blocked_id,
        createdAt: row.created_at,
      }));

      const hiddenConversations: ExportedHiddenConversation[] = hiddenConversationRows.map((row: any) => ({
        requestId: row.request_id,
        hiddenAt: row.hidden_at,
      }));

      const preferences: ExportedUserPreferences | null = preferencesRes.data
        ? {
            phone: preferencesRes.data.phone ?? undefined,
            neighborhood: preferencesRes.data.neighborhood ?? undefined,
            pushToken: preferencesRes.data.push_token ?? undefined,
            mutedTypes: Array.isArray(preferencesRes.data.muted_types) ? preferencesRes.data.muted_types : [],
            updatedAt: preferencesRes.data.updated_at ?? undefined,
          }
        : null;

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
        profile: profileRes.data
          ? {
              name: profileRes.data.name,
              joinedAt: profileRes.data.created_at,
              photoUrl: profileRes.data.photo_url ?? undefined,
              socialHandle: profileRes.data.social_handle ?? undefined,
            }
          : null,
        preferences,
        listings,
        sentRequests,
        receivedRequests,
        negotiationMessages,
        meetings,
        deliveries,
        favorites,
        searchAlerts,
        searchHistory: [],
        notifications,
        reports,
        userReports,
        blockedUsers,
        hiddenConversations,
        ratingsGiven: givenRows.map(mapRating),
        ratingsReceived: receivedRatingRows.map(mapRating),
      };
    } catch (err) {
      if (err instanceof DataSourceError) throw err;
      throw new DataSourceError("Erro inesperado ao exportar dados do usuário.");
    }
  }
}
