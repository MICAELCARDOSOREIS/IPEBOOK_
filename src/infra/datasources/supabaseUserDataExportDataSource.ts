import type { SupabaseAppClient } from "@/infra/supabaseClient";
import type { IUserDataExportDataSource } from "@/model/datasources/iUserDataExportDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";
import type { SearchAlert } from "@/model/entities/searchAlert";
import type { UserExportData } from "@/model/entities/userExportData";
import { DataSourceError } from "@/model/errors";

export class SupabaseUserDataExportDataSource implements IUserDataExportDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async exportUserData(userId: string): Promise<UserExportData> {
    try {
      const [booksRes, sentReqsRes, favsRes, alertsRes] = await Promise.all([
        this.client.from("v2_books").select("*").eq("owner_id", userId),
        this.client.from("v2_book_requests").select("*").eq("requester_id", userId),
        this.client.from("v2_favorites").select("book_id").eq("user_id", userId),
        this.client.from("v2_search_alerts").select("*").eq("user_id", userId),
      ]);

      if (booksRes.error) throw new DataSourceError("Falha ao exportar anúncios do usuário.");
      if (sentReqsRes.error) throw new DataSourceError("Falha ao exportar pedidos do usuário.");
      if (favsRes.error) throw new DataSourceError("Falha ao exportar favoritos do usuário.");
      if (alertsRes.error) throw new DataSourceError("Falha ao exportar alertas do usuário.");

      const listings: Book[] = (booksRes.data ?? []).map((row: any) => ({
        id: row.id,
        ownerId: row.owner_id,
        title: row.title,
        author: row.author,
        modality: row.modality,
        status: row.status,
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
        const receivedRes = await this.client
          .from("v2_book_requests")
          .select("*")
          .in("listing_id", listingIds);
        if (!receivedRes.error && receivedRes.data) {
          receivedRequests = receivedRes.data.map((row: any) => ({
            id: row.id,
            listingId: row.listing_id,
            requesterId: row.requester_id,
            status: row.status,
            createdAt: row.created_at,
          }));
        }
      }

      const sentRequests: BookRequest[] = (sentReqsRes.data ?? []).map((row: any) => ({
        id: row.id,
        listingId: row.listing_id,
        requesterId: row.requester_id,
        status: row.status,
        createdAt: row.created_at,
      }));

      const favorites: string[] = (favsRes.data ?? []).map((row: any) => row.book_id);

      const searchAlerts: SearchAlert[] = (alertsRes.data ?? []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        query: row.query,
        category: row.category,
        active: row.active,
        createdAt: row.created_at,
      }));

      return {
        userId,
        exportedAt: new Date().toISOString(),
        listings,
        sentRequests,
        receivedRequests,
        favorites,
        searchAlerts,
      };
    } catch (err) {
      if (err instanceof DataSourceError) throw err;
      throw new DataSourceError("Erro inesperado ao exportar dados do usuário.");
    }
  }
}
