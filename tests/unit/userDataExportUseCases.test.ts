import { describe, expect, it, vi } from "vitest";
import { UserDataExportUseCases } from "@/usecase/userDataExportUseCases";
import { MemoryUserDataExportDataSource } from "@/infra/datasources/memoryUserDataExportDataSource";
import { SupabaseUserDataExportDataSource } from "@/infra/datasources/supabaseUserDataExportDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import type { Book } from "@/model/entities/book";

describe("UserDataExportUseCases & DataSources (Portabilidade LGPD)", () => {
  it("rejeita exportação com identificador de usuário vazio ou inválido", async () => {
    const memoryDs = new MemoryUserDataExportDataSource();
    const useCases = new UserDataExportUseCases(memoryDs);

    await expect(useCases.exportUserData("")).rejects.toThrow(
      "Identificador de usuário inválido para exportação de dados."
    );
    await expect(useCases.exportUserData("   ")).rejects.toThrow(
      "Identificador de usuário inválido para exportação de dados."
    );
  });

  it("exporta dados completos do usuário em memória", async () => {
    const booksDs = new MemoryBookDataSource();
    const requestsDs = new MemoryBookRequestDataSource();
    const favoritesDs = new MemoryFavoriteDataSource();
    const notificationsDs = new MemoryNotificationDataSource();
    const alertsDs = new MemorySearchAlertDataSource(notificationsDs);

    const userId = "user-123";
    const otherId = "user-999";

    const book1 = await booksDs.create({
      ownerId: userId,
      title: "Livro do Usuário",
      author: "Autor A",
      modality: "donation",
      status: "available",
    });

    await booksDs.create({
      ownerId: otherId,
      title: "Livro de Outro",
      author: "Autor B",
      modality: "donation",
      status: "available",
    });

    await requestsDs.create({
      listingId: "listing-abc",
      requesterId: userId,
      status: "pending",
    });

    await requestsDs.create({
      listingId: book1.id,
      requesterId: otherId,
      status: "pending",
    });

    await favoritesDs.add(userId, "fav-book-id");
    await alertsDs.add(userId, "Ficção");

    const exportDs = new MemoryUserDataExportDataSource(
      booksDs,
      requestsDs,
      favoritesDs,
      alertsDs
    );
    const useCases = new UserDataExportUseCases(exportDs);

    const result = await useCases.exportUserData(userId);

    expect(result.userId).toBe(userId);
    expect(result.exportedAt).toBeDefined();
    expect(result.listings).toHaveLength(1);
    expect(result.listings[0].title).toBe("Livro do Usuário");
    expect(result.sentRequests).toHaveLength(1);
    expect(result.sentRequests[0].listingId).toBe("listing-abc");
    expect(result.receivedRequests).toHaveLength(1);
    expect(result.receivedRequests[0].requesterId).toBe(otherId);
    expect(result.favorites).toContain("fav-book-id");
    expect(result.searchAlerts).toHaveLength(1);
    expect(result.searchAlerts[0].query).toBe("Ficção");
  });

  it("exporta via SupabaseUserDataExportDataSource com mock de PostgREST", async () => {
    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "v2_books") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [
                  {
                    id: "b1",
                    owner_id: "user-1",
                    title: "Livro Supabase",
                    author: "Autor S",
                    modality: "trade",
                    status: "available",
                    photos: [],
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      if (table === "v2_book_requests") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [
                  {
                    id: "r1",
                    listing_id: "other-book",
                    requester_id: "user-1",
                    status: "pending",
                    created_at: "2026-10-20T00:00:00Z",
                  },
                ],
                error: null,
              }),
            in: () =>
              Promise.resolve({
                data: [
                  {
                    id: "r2",
                    listing_id: "b1",
                    requester_id: "other-user",
                    status: "accepted",
                    created_at: "2026-10-20T00:00:00Z",
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      if (table === "v2_favorites") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [{ book_id: "fav-1" }],
                error: null,
              }),
          }),
        };
      }
      if (table === "v2_search_alerts") {
        return {
          select: () => ({
            eq: () =>
              Promise.resolve({
                data: [
                  {
                    id: "a1",
                    user_id: "user-1",
                    query: "Computação",
                    active: true,
                    created_at: "2026-10-20T00:00:00Z",
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      return {
        select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
      };
    });

    const mockClient = { from: mockFrom } as any;
    const supabaseDs = new SupabaseUserDataExportDataSource(mockClient);

    const data = await supabaseDs.exportUserData("user-1");
    expect(data.userId).toBe("user-1");
    expect(data.listings).toHaveLength(1);
    expect(data.listings[0].title).toBe("Livro Supabase");
    expect(data.sentRequests).toHaveLength(1);
    expect(data.receivedRequests).toHaveLength(1);
    expect(data.favorites).toEqual(["fav-1"]);
    expect(data.searchAlerts).toHaveLength(1);
  });
});
