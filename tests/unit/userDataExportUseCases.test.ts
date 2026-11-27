import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBlockedUserDataSource } from "@/infra/datasources/memoryBlockedUserDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryDeliveryDataSource } from "@/infra/datasources/memoryDeliveryDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemoryMeetingDataSource } from "@/infra/datasources/memoryMeetingDataSource";
import { MemoryMessageDataSource } from "@/infra/datasources/memoryMessageDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { MemoryRatingDataSource } from "@/infra/datasources/memoryRatingDataSource";
import { MemoryReportDataSource } from "@/infra/datasources/memoryReportDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { MemoryUserDataExportDataSource } from "@/infra/datasources/memoryUserDataExportDataSource";
import { MemoryUserPreferencesDataSource } from "@/infra/datasources/memoryUserPreferencesDataSource";
import { SupabaseUserDataExportDataSource } from "@/infra/datasources/supabaseUserDataExportDataSource";
import { UserDataExportUseCases } from "@/usecase/userDataExportUseCases";

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

  it("inclui cadastro, perfil, preferências, mensagens, encontros, entregas, bloqueios, denúncias, conversas ocultas, avaliações e histórico local (Spec 143 / A3)", async () => {
    const auth = new MemoryAuthDataSource();
    const user = await auth.signUp("leitor@example.com", "senha-exemplo", "Leitora");
    const profiles = new MemoryProfileDataSource();
    await profiles.ensure(user.id, "Leitora");
    const books = new MemoryBookDataSource();
    const myBook = await books.create({
      ownerId: user.id,
      title: "Box Completo",
      author: "Autora",
      modality: "trade",
      status: "available",
      isBox: true,
      boxVolumesCount: 3,
    });
    const requests = new MemoryBookRequestDataSource();
    const sentReq = await requests.create({
      listingId: "other-book",
      requesterId: user.id,
      status: "accepted",
      initialMessage: "Vamos trocar?",
      offeredBookId: myBook.id,
    });
    const notifications = new MemoryNotificationDataSource([]);
    await notifications.addNotification({ id: "n1", userId: user.id, title: "Aviso", message: "Mensagem", type: "system", read: false, createdAt: "2026-10-20" });
    const userPreferences = new MemoryUserPreferencesDataSource();
    await userPreferences.upsert(user.id, { phone: "86999990000", neighborhood: "Centro", mutedTypes: ["system"] });
    const messages = new MemoryMessageDataSource();
    await messages.sendMessage({ requestId: sentReq.id, senderId: user.id, content: "Chego às 10h" });
    await messages.hideConversation(sentReq.id, user.id);
    const meetings = new MemoryMeetingDataSource(requests, books, notifications);
    await meetings.create({ requestId: sentReq.id, pointName: "Praça da Bandeira (Centro)", scheduledAt: "2026-11-26T10:00:00Z", proposedBy: user.id });
    const deliveries = new MemoryDeliveryDataSource(requests, books, notifications);
    const { code } = await deliveries.createCode(sentReq.id, "owner-other");
    await deliveries.complete(sentReq.id, code, user.id);
    const blockedUsers = new MemoryBlockedUserDataSource([], profiles);
    await blockedUsers.block(user.id, "blocked-1");
    const reports = new MemoryReportDataSource();
    await reports.create({ listingId: "b1", reporterId: user.id, reason: "other" });
    await reports.createUserReport({ reportedUserId: "bad-user", reporterId: user.id, reason: "abusive_behavior", details: "Ofensa" });
    const ratings = new MemoryRatingDataSource();
    await ratings.create({ raterId: user.id, ratedUserId: "other", requestId: sentReq.id, score: 5 });

    const source = new MemoryUserDataExportDataSource(books, requests, undefined, undefined, {
      auth,
      profiles,
      userPreferences,
      messages,
      meetings,
      deliveries,
      blockedUsers,
      notifications,
      reports,
      ratings,
    });
    const history = { listTerms: jest.fn().mockResolvedValue(["Romance"]) } as any;
    const data = await new UserDataExportUseCases(source, history).exportUserData(user.id);
    expect(data.account).toMatchObject({ email: "leitor@example.com", name: "Leitora" });
    expect(data.profile).toMatchObject({ name: "Leitora" });
    expect(data.preferences).toMatchObject({ phone: "86999990000", neighborhood: "Centro", mutedTypes: ["system"] });
    expect(data.sentRequests[0]).toMatchObject({ initialMessage: "Vamos trocar?", offeredBookId: myBook.id });
    expect(data.negotiationMessages).toHaveLength(1);
    expect(data.meetings).toHaveLength(1);
    expect(data.deliveries).toHaveLength(1);
    expect(data.blockedUsers).toHaveLength(1);
    expect(data.blockedUsers[0].blockedId).toBe("blocked-1");
    expect(data.userReports).toHaveLength(1);
    expect(data.hiddenConversations).toHaveLength(1);
    expect(data.hiddenConversations[0].requestId).toBe(sentReq.id);
    expect(data.notifications).toHaveLength(1);
    expect(data.reports).toHaveLength(1);
    expect(data.ratingsGiven).toHaveLength(1);
    expect(data.searchHistory).toEqual(["Romance"]);
  });

  it("exporta via SupabaseUserDataExportDataSource com todas as tabelas LGPD (Spec 143 / A3)", async () => {
    const rows: Record<string, any[]> = {
      v2_books: [{
        id: "b1",
        owner_id: "user-1",
        title: "Livro Supabase",
        author: "Autor S",
        modality: "trade",
        status: "available",
        photos: [],
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-02T00:00:00Z",
        is_box: true,
        box_volumes_count: 3,
        publisher: "Companhia",
        publication_year: 2020,
        moderation_hold: false,
      }],
      v2_book_requests: [{
        id: "r1",
        listing_id: "other-book",
        requester_id: "user-1",
        status: "pending",
        initial_message: "Tenho interesse!",
        offered_book_id: "b1",
        created_at: "2026-10-20T00:00:00Z",
      }],
      v2_favorites: [{ book_id: "fav-1" }],
      v2_search_alerts: Array.from({ length: 501 }, (_, index) => ({ id: `a${index}`, user_id: "user-1", query: "Computação", active: true, created_at: "2026-10-20T00:00:00Z" })),
      v2_notifications: [{ id: "n1", user_id: "user-1", title: "Aviso", message: "Mensagem", type: "system", read: false, created_at: "2026-10-20" }],
      v2_reports: [{ id: "d1", listing_id: "b1", reporter_id: "user-1", reason: "other", created_at: "2026-10-20" }],
      v2_user_reports: [{ id: "ur1", reported_user_id: "user-2", reporter_id: "user-1", reason: "fraud_or_scam", details: "Suspeito", created_at: "2026-10-21" }],
      v2_blocked_users: [{ blocker_id: "user-1", blocked_id: "user-2", created_at: "2026-10-21" }],
      v2_hidden_conversations: [{ user_id: "user-1", request_id: "r1", hidden_at: "2026-10-22" }],
      v2_ratings: [{ id: "v1", rater_id: "user-1", rated_user_id: "other-user", request_id: "r1", score: 5, created_at: "2026-10-20" }],
    };
    const inRows: Record<string, any[]> = {
      v2_book_requests: [{ id: "r2", listing_id: "b1", requester_id: "other-user", status: "accepted", initial_message: "Quero trocar", offered_book_id: "b-other", created_at: "2026-10-20T00:00:00Z" }],
      v2_negotiation_messages: [{ id: "m1", request_id: "r2", sender_id: "user-1", content: "Combinado!", created_at: "2026-10-21T10:00:00Z" }],
      v2_meetings: [{ id: "mt1", request_id: "r2", point_name: "Praça da Bandeira (Centro)", scheduled_at: "2026-10-22T10:00:00Z", status: "confirmed", proposed_by: "user-1" }],
      v2_deliveries: [{ request_id: "r2", completed_by: "other-user", completed_at: "2026-10-22T10:30:00Z" }],
    };
    const paged = (items: any[]) => ({
      order: () => paged(items),
      range: (start: number, end: number) => Promise.resolve({ data: items.slice(start, end + 1), error: null }),
    });
    const mockFrom = jest.fn().mockImplementation((table: string) => ({
      select: () => ({
        eq: () => {
          if (table === "v2_profiles") {
            return { maybeSingle: () => Promise.resolve({ data: { id: "user-1", name: "Leitora", created_at: "2026-01-01" }, error: null }) };
          }
          if (table === "v2_user_preferences") {
            return { maybeSingle: () => Promise.resolve({ data: { user_id: "user-1", phone: "86999990000", neighborhood: "Centro", muted_types: ["system"], updated_at: "2026-10-20" }, error: null }) };
          }
          return paged(rows[table] ?? []);
        },
        in: () => paged(inRows[table] ?? []),
      }),
    }));

    const mockClient = {
      from: mockFrom,
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: {
        id: "user-1", email: "leitor@example.com", user_metadata: { full_name: "Leitora" },
      } }, error: null }) },
    } as any;
    const supabaseDs = new SupabaseUserDataExportDataSource(mockClient);

    const data = await supabaseDs.exportUserData("user-1");
    expect(data.userId).toBe("user-1");
    expect(data.listings).toHaveLength(1);
    expect(data.listings[0]).toMatchObject({
      title: "Livro Supabase",
      isBox: true,
      boxVolumesCount: 3,
      publisher: "Companhia",
      publicationYear: 2020,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-02T00:00:00Z",
      moderationHold: false,
    });
    expect(data.preferences).toMatchObject({ phone: "86999990000", neighborhood: "Centro", mutedTypes: ["system"] });
    expect(data.sentRequests[0]).toMatchObject({ initialMessage: "Tenho interesse!", offeredBookId: "b1" });
    expect(data.receivedRequests[0]).toMatchObject({ initialMessage: "Quero trocar", offeredBookId: "b-other" });
    expect(data.negotiationMessages).toHaveLength(1);
    expect(data.meetings).toHaveLength(1);
    expect(data.deliveries).toHaveLength(1);
    expect(data.blockedUsers).toEqual([{ blockedId: "user-2", createdAt: "2026-10-21" }]);
    expect(data.userReports).toHaveLength(1);
    expect(data.hiddenConversations).toEqual([{ requestId: "r1", hiddenAt: "2026-10-22" }]);
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
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "leitor@example.com" } }, error: null }) },
      from: (table: string) => ({ select: () => ({
        eq: () => table === "v2_profiles" || table === "v2_user_preferences"
          ? { maybeSingle: () => Promise.resolve({ data: null, error: null }) }
          : { order: () => ({ range: () => Promise.resolve({ data: [], error: table === "v2_notifications" ? { message: "falha" } : null }) }) },
      }) }),
    } as any;
    await expect(new SupabaseUserDataExportDataSource(client).exportUserData("user-1"))
      .rejects.toThrow("Falha ao exportar notificações do usuário.");
  });
});
