import { describe, expect, it, vi } from "vitest";
import { SupabaseAuthDataSource } from "@/infra/datasources/supabaseAuthDataSource";
import { SupabaseBookDataSource } from "@/infra/datasources/supabaseBookDataSource";
import { SupabaseBookRequestDataSource } from "@/infra/datasources/supabaseBookRequestDataSource";
import { SupabaseNotificationDataSource } from "@/infra/datasources/supabaseNotificationDataSource";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(value: unknown): SupabaseAppClient {
  return value as SupabaseAppClient;
}

describe("datasources Supabase", () => {
  it("cria conta e lê sessão confirmada sem expor os dados internos do provedor", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: "1", email: "pessoa@exemplo.com" } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "1", email: "pessoa@exemplo.com" } } }, error: null }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signUp("pessoa@exemplo.com", "senha1234")).resolves.toEqual({ id: "1", email: "pessoa@exemplo.com" });
    await expect(auth.currentUser()).resolves.toEqual({ id: "1", email: "pessoa@exemplo.com" });
  });

  it("trata cadastro, sessão e saída com respostas de erro seguras", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: "interno" } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: { message: "interno" } }),
      signOut: vi.fn().mockResolvedValue({ error: { message: "interno" } }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signUp("pessoa@exemplo.com", "senha1234")).rejects.toThrow("Não foi possível criar a conta.");
    await expect(auth.currentUser()).rejects.toThrow("Não foi possível conferir a sessão.");
    await expect(auth.signOut()).rejects.toThrow("Não foi possível sair.");
  });

  it("entra, sai e reconhece sessão ausente", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: "1", email: "pessoa@exemplo.com" } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signIn("pessoa@exemplo.com", "senha1234")).resolves.toEqual({ id: "1", email: "pessoa@exemplo.com" });
    await expect(auth.currentUser()).resolves.toBeNull();
    await expect(auth.signOut()).resolves.toBeUndefined();
  });

  it("envia a recuperação por link sem retornar senha ou revelar a conta", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    const auth = new SupabaseAuthDataSource(
      fakeClient({ auth: { resetPasswordForEmail } }),
      "https://ipebook.exemplo/app/redefinir-senha",
    );

    await expect(auth.requestPasswordReset("pessoa@exemplo.com")).resolves.toBeUndefined();
    expect(resetPasswordForEmail).toHaveBeenCalledWith("pessoa@exemplo.com", {
      redirectTo: "https://ipebook.exemplo/app/redefinir-senha",
    });
  });

  it("não vaza detalhes do provedor em falha de autenticação", async () => {
    const auth = new SupabaseAuthDataSource(
      fakeClient({ auth: { signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: new Error("detalhe interno") }) } }),
      "ipebook://redefinir-senha",
    );
    await expect(auth.signIn("pessoa@exemplo.com", "senha1234")).rejects.toThrow(
      "Credenciais inválidas ou conta ainda não confirmada.",
    );
  });

  it("não atualiza a senha sem sessão de recuperação", async () => {
    const updateUser = vi.fn();
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      updateUser,
    } }), "ipebook://redefinir-senha");
    await expect(auth.completePasswordReset(null, "senha-nova")).rejects.toThrow(
      "Link de recuperação inválido ou expirado.",
    );
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("redefine senha com código válido e encerra a sessão", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession, updateUser, signOut,
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "1" } } }, error: null }),
    } }), "https://ipebook.exemplo/app/redefinir-senha");
    await auth.completePasswordReset("https://ipebook.exemplo/app/redefinir-senha?code=abc", "nova-senha");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(updateUser).toHaveBeenCalledWith({ password: "nova-senha" });
    expect(signOut).toHaveBeenCalled();
  });

  it("redefine senha com tokens do link nativo", async () => {
    const setSession = vi.fn().mockResolvedValue({ error: null });
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      setSession,
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "1" } } }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    } }), "ipebook://redefinir-senha");
    await auth.completePasswordReset("ipebook://redefinir-senha#access_token=abc&refresh_token=def", "nova-senha");
    expect(setSession).toHaveBeenCalledWith({ access_token: "abc", refresh_token: "def" });
  });

  it("rejeita link malformado, código vencido e atualização negada", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: "vencido" } }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.completePasswordReset("sem-url", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    await expect(auth.completePasswordReset("ipebook://redefinir-senha", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    await expect(auth.completePasswordReset("ipebook://redefinir-senha?code=vencido", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    const denied = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: { message: "negado" } }),
    } }), "ipebook://redefinir-senha");
    await expect(denied.completePasswordReset("ipebook://redefinir-senha?code=abc", "nova-senha")).rejects.toThrow("Não foi possível atualizar a senha.");
  });

  it("converte livro remoto e preserva o proprietário na criação", async () => {
    const row = {
      id: "livro-1", title: "Dom Casmurro", author: "Machado de Assis",
      owner_id: "dono-1", modality: "sale", price: 29.9, status: "available",
    };
    const single = vi.fn().mockResolvedValue({ data: row, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    const books = new SupabaseBookDataSource(fakeClient({ from }));

    const created = await books.create({
      title: row.title, author: row.author, ownerId: row.owner_id,
      modality: "sale", price: 29.9, status: "available",
    });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ owner_id: "dono-1" }));
    expect(from).toHaveBeenCalledWith("v2_books");
    expect(created).toEqual({
      id: "livro-1", title: row.title, author: row.author,
      ownerId: "dono-1", modality: "sale", price: 29.9, status: "available",
    });
  });

  it("lista, consulta e atualiza livros com os dados remotos", async () => {
    const row = { id: "1", title: "Livro", author: "Autora", owner_id: "dono", modality: "donation", price: null, status: "available" };
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
    const single = vi.fn().mockResolvedValue({ data: { ...row, status: "reserved" }, error: null });
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order,
        neq: vi.fn().mockReturnValue({ order }),
        eq: vi.fn().mockReturnValue({ maybeSingle, order }),
      }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single }) }) }),
    });
    const books = new SupabaseBookDataSource(fakeClient({ from }));
    await expect(books.list()).resolves.toEqual([{ id: "1", title: "Livro", author: "Autora", ownerId: "dono", modality: "donation", status: "available" }]);
    await expect(books.findById("1")).resolves.toMatchObject({ id: "1", ownerId: "dono" });
    await expect(books.updateStatus("1", "reserved")).resolves.toMatchObject({ id: "1", status: "reserved" });
    await expect(books.update("1", { title: "Novo Título" })).resolves.toMatchObject({ id: "1" });
    expect(from).toHaveBeenCalledWith("v2_books");
  });

  it("trata catálogo vazio, livro ausente e falhas do banco sem detalhes internos", async () => {
    const empty = new SupabaseBookDataSource(fakeClient({ from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        neq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }) }));
    await expect(empty.list()).resolves.toEqual([]);
    await expect(empty.findById("ausente")).resolves.toBeNull();

    const failed = new SupabaseBookDataSource(fakeClient({ from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }),
        neq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }),
        }),
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }),
          order: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }),
        }),
      }),
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }) }) }),
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: { message: "interno" } }) }) }) }),
    }) }));
    await expect(failed.list()).rejects.toThrow("Não foi possível carregar os livros.");
    await expect(failed.findById("1")).rejects.toThrow("Não foi possível consultar o anúncio.");
    await expect(failed.create({ title: "Livro", author: "Autora", ownerId: "1", modality: "donation", status: "available" })).rejects.toThrow("Não foi possível cadastrar o anúncio.");
    await expect(failed.updateStatus("1", "reserved")).rejects.toThrow("Não foi possível atualizar o anúncio.");
  });

  it("cria, lista e responde pedidos persistidos", async () => {
    const row = { id: "pedido-1", listing_id: "livro-1", requester_id: "pessoa-1", status: "pending" };
    const select = vi.fn().mockImplementation(() => ({
      single: vi.fn().mockResolvedValue({ data: row, error: null }),
      eq: vi.fn().mockImplementation(() => Object.assign(Promise.resolve({ data: [row], error: null }), {
        maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }),
      })),
    }));
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({ select }),
      select,
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { ...row, status: "accepted" }, error: null }) }),
      }) }) }),
    });
    const requests = new SupabaseBookRequestDataSource(fakeClient({ from }));
    await expect(requests.create({ listingId: "livro-1", requesterId: "pessoa-1", status: "pending" })).resolves.toMatchObject({ id: "pedido-1" });
    await expect(requests.findById("pedido-1")).resolves.toMatchObject({ id: "pedido-1" });
    await expect(requests.listByListing("livro-1")).resolves.toHaveLength(1);
    await expect(requests.listByRequester("pessoa-1")).resolves.toHaveLength(1);
    await expect(requests.respond("pedido-1", "accepted")).resolves.toMatchObject({ status: "accepted" });
    expect(from).toHaveBeenCalledWith("v2_book_requests");
  });

  it("não retorna pedido alheio quando a consulta é negada", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "RLS denied" } });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const requests = new SupabaseBookRequestDataSource(fakeClient({
      from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ eq }) }),
    }));
    await expect(requests.findById("pedido-1")).rejects.toThrow("Não foi possível consultar o pedido.");
  });

  it("trata falhas de criação, listagem e resposta de pedidos sem vazar o banco", async () => {
    const error = { message: "detalhe interno" };
    const select = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error }),
      eq: vi.fn().mockResolvedValue({ data: null, error }),
    });
    const requests = new SupabaseBookRequestDataSource(fakeClient({ from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({ select }),
      select,
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select }) }) }),
    }) }));
    await expect(requests.create({ listingId: "livro", requesterId: "pessoa", status: "pending" })).rejects.toThrow("Não foi possível solicitar a negociação.");
    await expect(requests.listByListing("livro")).rejects.toThrow("Não foi possível carregar os pedidos.");
    await expect(requests.listByRequester("pessoa")).rejects.toThrow("Não foi possível carregar os pedidos.");
    await expect(requests.respond("pedido", "rejected")).rejects.toThrow("Não foi possível responder ao pedido.");
  });

  it("lista, marca como lida e cria notificações via Supabase com tratamento de erro", async () => {
    const row = {
      id: "notif-1",
      user_id: "user-1",
      title: "Pedido aceito",
      message: "Seu livro está pronto para troca",
      type: "request_accepted",
      read: false,
      created_at: "2026-10-15T12:00:00Z",
      action_url: "/negociacao/1",
    };
    const order = vi.fn().mockResolvedValue({ data: [row], error: null });
    const eqSelect = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq: eqSelect });
    const eqUpdate = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn().mockReturnValue({ eq: eqUpdate });
    const insert = vi.fn().mockResolvedValue({ error: null });

    const from = vi.fn().mockImplementation((table: string) => {
      expect(table).toBe("v2_notifications");
      return { select, update, insert };
    });

    const notifDs = new SupabaseNotificationDataSource(fakeClient({ from }));

    const list = await notifDs.listByUser("user-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("notif-1");
    expect(list[0].actionUrl).toBe("/negociacao/1");

    await expect(notifDs.markAsRead("notif-1")).resolves.toBeUndefined();
    await expect(notifDs.markAllAsRead("user-1")).resolves.toBeUndefined();
    await expect(
      notifDs.addNotification({
        id: "notif-2",
        userId: "user-1",
        title: "Dica",
        message: "IFPI",
        type: "safety_tip",
        read: false,
        createdAt: "2026-10-15T12:00:00Z",
      }),
    ).resolves.toBeUndefined();
  });

  it("trata erros nas operações de notificação do Supabase", async () => {
    const error = { message: "falha no banco" };
    const order = vi.fn().mockResolvedValue({ data: null, error });
    const eqSelect = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq: eqSelect });
    const eqUpdate = vi.fn().mockResolvedValue({ error });
    const update = vi.fn().mockReturnValue({ eq: eqUpdate });
    const insert = vi.fn().mockResolvedValue({ error });

    const from = vi.fn().mockReturnValue({ select, update, insert });
    const notifDs = new SupabaseNotificationDataSource(fakeClient({ from }));

    await expect(notifDs.listByUser("user-1")).rejects.toThrow("Não foi possível carregar as notificações.");
    await expect(notifDs.markAsRead("notif-1")).rejects.toThrow("Não foi possível atualizar a notificação.");
    await expect(notifDs.markAllAsRead("user-1")).rejects.toThrow("Não foi possível marcar as notificações como lidas.");
    await expect(
      notifDs.addNotification({
        id: "notif-2",
        userId: "user-1",
        title: "Dica",
        message: "IFPI",
        type: "safety_tip",
        read: false,
        createdAt: "2026-10-15T12:00:00Z",
      }),
    ).rejects.toThrow("Não foi possível criar a notificação.");
  });
});
