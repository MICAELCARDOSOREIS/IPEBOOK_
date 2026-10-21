import { describe, expect, it, vi } from "vitest";
import { UserDataExportUseCases } from "@/usecase/userDataExportUseCases";
import { MemoryUserDataExportDataSource } from "@/infra/datasources/memoryUserDataExportDataSource";
import { SupabaseUserDataExportDataSource } from "@/infra/datasources/supabaseUserDataExportDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
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

  it("inclui cadastro, perfil, notificações, denúncias, avaliações e histórico local", async () => {
    const auth = new MemoryAuthDataSource();
    const user = await auth.signUp("leitor@example.com", "senha-exemplo", "Leitora");
    const profiles = new MemoryProfileDataSource();
    await profiles.ensure(user.id, "Leitora");
    const notifications = new MemoryNotificationDataSource([]);
    await notifications.addNotification({ id: "n1", userId: user.id, title: "Aviso", message: "Mensagem", type: "system", read: false, createdAt: "2026-10-20" });
    const reports = new MemoryReportDataSource();
    await reports.create({ listingId: "b1", reporterId: user.id, reason: "other" });
    const ratings = new MemoryRatingDataSource();
    await ratings.create({ raterId: user.id, ratedUserId: "other", requestId: "r1", score: 5 });
    const source = new MemoryUserDataExportDataSource(undefined, undefined, undefined, undefined, {
      auth, profiles, notifications, reports, ratings,
    });
    const history = { listTerms: vi.fn().mockResolvedValue(["Romance"]) } as any;
    const data = await new UserDataExportUseCases(source, history).exportUserData(user.id);
    expect(data.account).toMatchObject({ email: "leitor@example.com", name: "Leitora" });
    expect(data.profile).toMatchObject({ name: "Leitora" });
    expect(data.notifications).toHaveLength(1);
    expect(data.reports).toHaveLength(1);
    expect(data.ratingsGiven).toHaveLength(1);
    expect(data.searchHistory).toEqual(["Romance"]);
  });

  it("exporta via SupabaseUserDataExportDataSource com mock de PostgREST", async () => {
    const rows: Record<string, any[]> = {
      v2_books: [{ id: "b1", owner_id: "user-1", title: "Livro Supabase", author: "Autor S", modality: "trade", status: "available", photos: [] }],
      v2_book_requests: [{ id: "r1", listing_id: "other-book", requester_id: "user-1", status: "pending", created_at: "2026-10-20T00:00:00Z" }],
      v2_favorites: [{ book_id: "fav-1" }],
      v2_search_alerts: Array.from({ length: 501 }, (_, index) => ({ id: `a${index}`, user_id: "user-1", query: "Computação", active: true, created_at: "2026-10-20T00:00:00Z" })),
      v2_notifications: [{ id: "n1", user_id: "user-1", title: "Aviso", message: "Mensagem", type: "system", read: false, created_at: "2026-10-20" }],
      v2_reports: [{ id: "d1", listing_id: "b1", reporter_id: "user-1", reason: "other", created_at: "2026-10-20" }],
      v2_ratings: [{ id: "v1", rater_id: "user-1", rated_user_id: "other-user", request_id: "r1", score: 5, created_at: "2026-10-20" }],
    };
    const paged = (items: any[]) => ({
      order: () => paged(items),
      range: (start: number, end: number) => Promise.resolve({ data: items.slice(start, end + 1), error: null }),
    });
    const mockFrom = vi.fn().mockImplementation((table: string) => ({
      select: () => ({
        eq: () => table === "v2_profiles"
          ? { maybeSingle: () => Promise.resolve({ data: { id: "user-1", name: "Leitora", created_at: "2026-01-01" }, error: null }) }
          : paged(rows[table] ?? []),
        in: () => paged([{ id: "r2", listing_id: "b1", requester_id: "other-user", status: "accepted", created_at: "2026-10-20T00:00:00Z" }]),
      }),
    }));

    const mockClient = {
      from: mockFrom,
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: {
        id: "user-1", email: "leitor@example.com", user_metadata: { full_name: "Leitora" },
      } }, error: null }) },
    } as any;
    const supabaseDs = new SupabaseUserDataExportDataSource(mockClient);

    const data = await supabaseDs.exportUserData("user-1");
    expect(data.userId).toBe("user-1");
    expect(data.listings).toHaveLength(1);
    expect(data.listings[0].title).toBe("Livro Supabase");
    expect(data.sentRequests).toHaveLength(1);
    expect(data.receivedRequests).toHaveLength(1);
    expect(data.favorites).toEqual(["fav-1"]);
    expect(data.searchAlerts).toHaveLength(501);
    expect(data.account).toMatchObject({ email: "leitor@example.com", name: "Leitora" });
    expect(data.profile).toMatchObject({ name: "Leitora" });
    expect(data.notifications).toHaveLength(1);
    expect(data.reports).toHaveLength(1);
    expect(data.ratingsGiven).toHaveLength(1);
    expect(data.ratingsReceived).toHaveLength(1);
  });

  it("recusa exportação parcial quando uma consulta de dados falha", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "leitor@example.com" } }, error: null }) },
      from: (table: string) => ({ select: () => ({
        eq: () => table === "v2_profiles"
          ? { maybeSingle: () => Promise.resolve({ data: null, error: null }) }
          : { order: () => ({ range: () => Promise.resolve({ data: [], error: table === "v2_notifications" ? { message: "falha" } : null }) }) },
      }) }),
    } as any;
    await expect(new SupabaseUserDataExportDataSource(client).exportUserData("user-1"))
      .rejects.toThrow("Falha ao exportar notificações do usuário.");
  });
});
