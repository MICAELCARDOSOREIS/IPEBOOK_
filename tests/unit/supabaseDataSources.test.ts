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
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: "1", email: "pessoa@exemplo.com", user_metadata: { full_name: "Leitora Teste" } } },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: "1", email: "pessoa@exemplo.com", user_metadata: { full_name: "Leitora Teste" } } } },
        error: null,
      }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signUp("pessoa@exemplo.com", "senha1234", "Leitora Teste")).resolves.toEqual({
      id: "1",
      email: "pessoa@exemplo.com",
      name: "Leitora Teste",
    });
    await expect(auth.currentUser()).resolves.toEqual({
      id: "1",
      email: "pessoa@exemplo.com",
      name: "Leitora Teste",
    });
  });

  it("trata cadastro, sessão e saída com respostas de erro seguras", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: { message: "interno" } }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: { message: "interno" } }),
      signOut: jest.fn().mockResolvedValue({ error: { message: "interno" } }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signUp("pessoa@exemplo.com", "senha1234", "Leitora Teste")).rejects.toThrow("Não foi possível criar a conta.");
    await expect(auth.currentUser()).resolves.toBeNull();
    await expect(auth.signOut()).rejects.toThrow("Não foi possível sair.");
  });

  it("entra, sai e reconhece sessão ausente", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: "1", email: "pessoa@exemplo.com" } }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.signIn("pessoa@exemplo.com", "senha1234")).resolves.toEqual({ id: "1", email: "pessoa@exemplo.com" });
    await expect(auth.currentUser()).resolves.toBeNull();
    await expect(auth.signOut()).resolves.toBeUndefined();
  });

  it("envia a recuperação por link sem retornar senha ou revelar a conta", async () => {
    const resetPasswordForEmail = jest.fn().mockResolvedValue({ error: null });
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
      fakeClient({ auth: { signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: new Error("detalhe interno") }) } }),
      "ipebook://redefinir-senha",
    );
    await expect(auth.signIn("pessoa@exemplo.com", "senha1234")).rejects.toThrow(
      "Credenciais inválidas ou conta ainda não confirmada.",
    );
  });

  it("não atualiza a senha sem sessão de recuperação", async () => {
    const updateUser = jest.fn();
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      updateUser,
    } }), "ipebook://redefinir-senha");
    await expect(auth.completePasswordReset(null, "senha-nova")).rejects.toThrow(
      "Link de recuperação inválido ou expirado.",
    );
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("redefine senha com código válido e encerra a sessão", async () => {
    const exchangeCodeForSession = jest.fn().mockResolvedValue({ error: null });
    const updateUser = jest.fn().mockResolvedValue({ error: null });
    const signOut = jest.fn().mockResolvedValue({ error: null });
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession, updateUser, signOut,
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: "1" } } }, error: null }),
    } }), "https://ipebook.exemplo/app/redefinir-senha");
    await auth.completePasswordReset("https://ipebook.exemplo/app/redefinir-senha?code=abc", "nova-senha");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(updateUser).toHaveBeenCalledWith({ password: "nova-senha" });
    expect(signOut).toHaveBeenCalled();
  });

  it("redefine senha com tokens do link nativo", async () => {
    const setSession = jest.fn().mockResolvedValue({ error: null });
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      setSession,
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: "1" } } }, error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    } }), "ipebook://redefinir-senha");
    await auth.completePasswordReset("ipebook://redefinir-senha#access_token=abc&refresh_token=def", "nova-senha");
    expect(setSession).toHaveBeenCalledWith({ access_token: "abc", refresh_token: "def" });
  });

  it("rejeita link malformado, código vencido e atualização negada", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: { message: "vencido" } }),
    } }), "ipebook://redefinir-senha");
    await expect(auth.completePasswordReset("sem-url", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    await expect(auth.completePasswordReset("ipebook://redefinir-senha", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    await expect(auth.completePasswordReset("ipebook://redefinir-senha?code=vencido", "nova-senha")).rejects.toThrow("Link de recuperação inválido");
    const denied = new SupabaseAuthDataSource(fakeClient({ auth: {
      exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: {} }, error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: { message: "negado" } }),
    } }), "ipebook://redefinir-senha");
    await expect(denied.completePasswordReset("ipebook://redefinir-senha?code=abc", "nova-senha")).rejects.toThrow("Não foi possível atualizar a senha.");
  });

  it("restaura sessão a partir de deep link OAuth com access_token e refresh_token", async () => {
    const setSession = jest.fn().mockResolvedValue({
      data: { user: { id: "google-123", email: "leitor@gmail.com", user_metadata: { full_name: "Micael" } } },
      error: null,
    });
    const auth = new SupabaseAuthDataSource(fakeClient({
      auth: { setSession, getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    }), "ipebook://redefinir-senha");

    const user = await auth.setSessionFromUrl("ipebook://auth/callback#access_token=jwt-token&refresh_token=ref-token");

    expect(setSession).toHaveBeenCalledWith({
      access_token: "jwt-token",
      refresh_token: "ref-token",
    });
    expect(user).toEqual({
      id: "google-123",
      email: "leitor@gmail.com",
      name: "Micael",
    });
  });

  it("restaura sessão a partir de deep link OAuth com code de autenticação", async () => {
    const exchangeCodeForSession = jest.fn().mockResolvedValue({
      data: { user: { id: "code-user", email: "code@gmail.com" } },
      error: null,
    });
    const auth = new SupabaseAuthDataSource(fakeClient({
      auth: { exchangeCodeForSession },
    }), "ipebook://redefinir-senha");

    const user = await auth.setSessionFromUrl("ipebook://auth/callback?code=auth-code-123");

    expect(exchangeCodeForSession).toHaveBeenCalledWith("auth-code-123");
    expect(user.id).toBe("code-user");
  });

  it("rejeita URL de callback sem tokens válidos", async () => {
    const auth = new SupabaseAuthDataSource(fakeClient({ auth: {} }), "ipebook://redefinir-senha");
    await expect(auth.setSessionFromUrl("ipebook://auth/callback")).rejects.toThrow(
      "URL de autenticação não contém tokens válidos.",
    );
  });

  it("exclui conta chamando a RPC delete_user_account e finaliza sessão", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const signOut = jest.fn().mockResolvedValue({ error: null });
    const list = jest.fn().mockResolvedValue({ data: [], error: null });
    const auth = new SupabaseAuthDataSource(
      fakeClient({ rpc, auth: { signOut }, storage: { from: jest.fn(() => ({ list, remove: jest.fn() })) } }),
      "https://ipebook.exemplo/app/redefinir-senha",
    );

    await auth.deleteAccount("user-123");

    expect(rpc).toHaveBeenCalledWith("delete_user_account", { target_user_id: "user-123" });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("lança AuthError ao falhar na RPC de exclusão de conta", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { message: "negado" } });
    const signOut = jest.fn().mockResolvedValue({ error: null });
    const list = jest.fn().mockResolvedValue({ data: [], error: null });
    const auth = new SupabaseAuthDataSource(
      fakeClient({ rpc, auth: { signOut }, storage: { from: jest.fn(() => ({ list, remove: jest.fn() })) } }),
      "https://ipebook.exemplo/app/redefinir-senha",
    );

    await expect(auth.deleteAccount("user-123")).rejects.toThrow(
      "Não foi possível excluir a conta. Tente novamente.",
    );
  });

  it("converte livro remoto e preserva o proprietário na criação", async () => {
    const row = {
      id: "livro-1", title: "Dom Casmurro", author: "Machado de Assis",
      owner_id: "dono-1", modality: "sale", price: 29.9, status: "available",
    };
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const from = jest.fn().mockReturnValue({ insert });
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

  it("envia e lê conservação e descrição do anúncio (Spec 030)", async () => {
    const row = {
      id: "livro-2", title: "O Cortiço", author: "Aluísio Azevedo",
      owner_id: "dono-2", modality: "donation", price: null, status: "available",
      condition: "marked", description: "Marcas leves de uso", neighborhood: "Centro",
    };
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select }) });
    const from = jest.fn().mockReturnValue({ insert, update });
    const books = new SupabaseBookDataSource(fakeClient({ from }));

    const created = await books.create({
      title: row.title, author: row.author, ownerId: row.owner_id,
      modality: "donation", status: "available", condition: "marked",
      description: "Marcas leves de uso",
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ condition: "marked", description: "Marcas leves de uso" }),
    );
    expect(created).toMatchObject({ condition: "marked", description: "Marcas leves de uso" });

    await books.update("livro-2", { condition: "worn", description: undefined });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ condition: "worn" }));
  });

  it("grava e lê sinopse, editora, páginas e ano da edição (Spec 097)", async () => {
    const row = {
      id: "livro-9", title: "1984", author: "George Orwell", owner_id: "dono-9", modality: "donation", price: null,
      status: "available", synopsis: "Distopia.", publisher: "Companhia das Letras", page_count: 416, publication_year: 2009,
    };
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select }) });
    const from = jest.fn().mockReturnValue({ insert, update });
    const books = new SupabaseBookDataSource(fakeClient({ from }));

    const created = await books.create({
      title: row.title, author: row.author, ownerId: row.owner_id, modality: "donation", status: "available",
      synopsis: "Distopia.", publisher: "Companhia das Letras", pageCount: 416, publicationYear: 2009,
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ synopsis: "Distopia.", publisher: "Companhia das Letras", page_count: 416, publication_year: 2009 }),
    );
    expect(created).toMatchObject({ synopsis: "Distopia.", publisher: "Companhia das Letras", pageCount: 416, publicationYear: 2009 });

    await books.update("livro-9", { synopsis: "Nova.", publisher: undefined, pageCount: 300, publicationYear: 2020 });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ synopsis: "Nova.", page_count: 300, publication_year: 2020 }));
  });

  it("omite conservação e descrição quando o registro remoto não tem os campos", async () => {
    const row = {
      id: "livro-3", title: "Iracema", author: "José de Alencar",
      owner_id: "dono-3", modality: "trade", price: null, status: "available",
      condition: null, description: null,
    };
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const insert = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single }) });
    const from = jest.fn().mockReturnValue({ insert });
    const books = new SupabaseBookDataSource(fakeClient({ from }));

    const created = await books.create({
      title: row.title, author: row.author, ownerId: row.owner_id,
      modality: "trade", status: "available",
    });
    expect(created.condition).toBeUndefined();
    expect(created.description).toBeUndefined();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ condition: null, description: null }),
    );
  });

  it("grava e lê campos de box e coleções de livros (Spec 112)", async () => {
    const row = {
      id: "livro-box-1", title: "Box Harry Potter", author: "J.K. Rowling",
      owner_id: "dono-box", modality: "sale", price: 250, status: "available",
      is_box: true, box_volumes_count: 7,
    };
    const single = jest.fn().mockResolvedValue({ data: row, error: null });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select }) });
    const from = jest.fn().mockReturnValue({ insert, update });
    const books = new SupabaseBookDataSource(fakeClient({ from }));

    const created = await books.create({
      title: row.title, author: row.author, ownerId: row.owner_id,
      modality: "sale", price: 250, status: "available",
      isBox: true, boxVolumesCount: 7,
    });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ is_box: true, box_volumes_count: 7 }),
    );
    expect(created).toMatchObject({ isBox: true, boxVolumesCount: 7 });

    await books.update("livro-box-1", { isBox: false, boxVolumesCount: undefined });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ is_box: false, box_volumes_count: null }),
    );
  });

  it("lista, consulta e atualiza livros com os dados remotos", async () => {
    const row = { id: "1", title: "Livro", author: "Autora", owner_id: "dono", modality: "donation", price: null, status: "available" };
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
    const single = jest.fn().mockResolvedValue({ data: { ...row, status: "reserved" }, error: null });
    const listChain: Record<string, unknown> = { order };
    listChain.neq = jest.fn(() => listChain);
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order,
        neq: listChain.neq,
        eq: jest.fn().mockReturnValue({ maybeSingle, order }),
      }),
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single }) }) }),
    });
    const books = new SupabaseBookDataSource(fakeClient({ from }));
    await expect(books.list()).resolves.toEqual([{ id: "1", title: "Livro", author: "Autora", ownerId: "dono", modality: "donation", status: "available" }]);
    await expect(books.findById("1")).resolves.toMatchObject({ id: "1", ownerId: "dono" });
    await expect(books.updateStatus("1", "reserved")).resolves.toMatchObject({ id: "1", status: "reserved" });
    await expect(books.update("1", { title: "Novo Título" })).resolves.toMatchObject({ id: "1" });
    expect(from).toHaveBeenCalledWith("v2_books");
  });

  it("aplica paginação com range quando limit e offset são fornecidos (Issue #117)", async () => {
    const row = { id: "p1", title: "Livro Paginado", author: "Autor", owner_id: "dono", modality: "donation", price: null, status: "available" };
    const range = jest.fn().mockResolvedValue({ data: [row], error: null });
    const order = jest.fn().mockReturnValue({ range });
    const listChain: Record<string, unknown> = { order };
    listChain.neq = jest.fn(() => listChain);
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        neq: listChain.neq,
      }),
    });
    const books = new SupabaseBookDataSource(fakeClient({ from }));
    const result = await books.list({ limit: 10, offset: 20 });

    expect(range).toHaveBeenCalledWith(20, 29);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("p1");
  });

  it("aplica filtro de bairro e modalidade na consulta remota (Spec 068 / ADR 0051)", async () => {
    const row = { id: "p2", title: "Livro no Centro", author: "Autor", owner_id: "dono", modality: "donation", price: null, status: "available", neighborhood: "Centro" };
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const eqModality = jest.fn().mockReturnValue({ order });
    const eqNeighborhood = jest.fn().mockReturnValue({ eq: eqModality, order });
    const neq = jest.fn();
    neq.mockReturnValue({ neq, eq: eqNeighborhood, order });
    const from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ neq }),
    });
    const books = new SupabaseBookDataSource(fakeClient({ from }));
    const result = await books.list({ neighborhood: "Centro", modality: "donation" });

    expect(eqNeighborhood).toHaveBeenCalledWith("neighborhood", "Centro");
    expect(eqModality).toHaveBeenCalledWith("modality", "donation");
    expect(result).toHaveLength(1);
    expect(result[0].neighborhood).toBe("Centro");
  });

  it("trata catálogo vazio, livro ausente e falhas do banco sem detalhes internos", async () => {
    const emptyOrder = jest.fn().mockResolvedValue({ data: [], error: null });
    const emptyNeq = jest.fn();
    emptyNeq.mockReturnValue({ order: emptyOrder, neq: emptyNeq });
    const empty = new SupabaseBookDataSource(fakeClient({ from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: emptyOrder,
        neq: emptyNeq,
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          order: emptyOrder,
        }),
      }),
    }) }));
    await expect(empty.list()).resolves.toEqual([]);
    await expect(empty.findById("ausente")).resolves.toBeNull();

    const failedOrder = jest.fn().mockResolvedValue({ data: null, error: { message: "interno" } });
    const failedNeq = jest.fn();
    failedNeq.mockReturnValue({ order: failedOrder, neq: failedNeq });
    const failed = new SupabaseBookDataSource(fakeClient({ from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: failedOrder,
        neq: failedNeq,
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { message: "interno" } }),
          order: failedOrder,
        }),
      }),
      insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: { message: "interno" } }) }) }),
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: null, error: { message: "interno" } }) }) }) }),
    }) }));
    await expect(failed.list()).rejects.toThrow("Não foi possível carregar os livros.");
    await expect(failed.findById("1")).rejects.toThrow("Não foi possível consultar o anúncio.");
    await expect(failed.create({ title: "Livro", author: "Autora", ownerId: "1", modality: "donation", status: "available" })).rejects.toThrow("Não foi possível cadastrar o anúncio.");
    await expect(failed.updateStatus("1", "reserved")).rejects.toThrow("Não foi possível atualizar o anúncio.");
  });

  it("cria, lista e responde pedidos persistidos", async () => {
    const row = { id: "pedido-1", listing_id: "livro-1", requester_id: "pessoa-1", status: "pending" };
    const select = jest.fn().mockImplementation(() => ({
      single: jest.fn().mockResolvedValue({ data: row, error: null }),
      eq: jest.fn().mockImplementation(() => Object.assign(Promise.resolve({ data: [row], error: null }), {
        maybeSingle: jest.fn().mockResolvedValue({ data: row, error: null }),
      })),
    }));
    const from = jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({ select }),
      select,
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { ...row, status: "accepted" }, error: null }) }),
      }) }) }),
    });
    const rpc = jest.fn().mockResolvedValue({ data: { ...row, status: "accepted" }, error: null });
    const requests = new SupabaseBookRequestDataSource(fakeClient({ from, rpc }));
    await expect(requests.create({ listingId: "livro-1", requesterId: "pessoa-1", status: "pending" })).resolves.toMatchObject({ id: "pedido-1" });
    await expect(requests.findById("pedido-1")).resolves.toMatchObject({ id: "pedido-1" });
    await expect(requests.listByListing("livro-1")).resolves.toHaveLength(1);
    await expect(requests.listByRequester("pessoa-1")).resolves.toHaveLength(1);
    await expect(requests.respond("pedido-1", "accepted")).resolves.toMatchObject({ status: "accepted" });
    expect(rpc).toHaveBeenCalledWith("accept_book_request", { target_request_id: "pedido-1" });
    expect(from).toHaveBeenCalledWith("v2_book_requests");
  });

  it("não retorna pedido alheio quando a consulta é negada", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: { message: "RLS denied" } });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const requests = new SupabaseBookRequestDataSource(fakeClient({
      from: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ eq }) }),
    }));
    await expect(requests.findById("pedido-1")).rejects.toThrow("Não foi possível consultar o pedido.");
  });

  it("aceita pedido pela RPC transacional e trata falha sem expor detalhes", async () => {
    const row = { id: "pedido-1", listing_id: "livro-1", requester_id: "pessoa-1", status: "accepted" };
    const rpc = jest.fn().mockResolvedValueOnce({ data: row, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "detalhe interno" } });
    const requests = new SupabaseBookRequestDataSource(fakeClient({ rpc }));
    await expect(requests.acceptAtomically("pedido-1")).resolves.toMatchObject({ status: "accepted" });
    expect(rpc).toHaveBeenCalledWith("accept_book_request", { target_request_id: "pedido-1" });
    await expect(requests.acceptAtomically("pedido-1")).rejects.toThrow("Não foi possível aceitar o pedido.");
  });

  it("trata falhas de criação, listagem e resposta de pedidos sem vazar o banco", async () => {
    const error = { message: "detalhe interno" };
    const select = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: null, error }),
      eq: jest.fn().mockResolvedValue({ data: null, error }),
    });
    const requests = new SupabaseBookRequestDataSource(fakeClient({ from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({ select }),
      select,
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ select }) }) }),
    }) }));
    await expect(requests.create({ listingId: "livro", requesterId: "pessoa", status: "pending" })).rejects.toThrow("Não foi possível solicitar a negociação.");
    await expect(requests.listByListing("livro")).rejects.toThrow("Não foi possível carregar os pedidos.");
    await expect(requests.listByRequester("pessoa")).rejects.toThrow("Não foi possível carregar os pedidos.");
    await expect(requests.respond("pedido", "rejected")).rejects.toThrow("Não foi possível responder ao pedido.");
  });

  it("atualiza a redação da dica de encontro legada e omite actionUrl quando ausente", async () => {
    const row = {
      id: "notif-2",
      user_id: "user-1",
      title: "Dica de segurança: Pontos Seguros",
      message: "Sempre marque entregas nos Pontos Seguros cadastrados (Praça da Bandeira, Estação Ferroviária, IFPI).",
      type: "safety_tip",
      read: false,
      created_at: "2026-10-15T12:00:00Z",
      action_url: null,
    };
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const eqSelect = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq: eqSelect });
    const from = jest.fn().mockReturnValue({ select });

    const notifDs = new SupabaseNotificationDataSource(fakeClient({ from }));
    const list = await notifDs.listByUser("user-1");

    expect(list[0]).toMatchObject({
      title: "Dica de segurança: pontos de encontro recomendados",
      message: "Marque as entregas em um dos pontos públicos recomendados em Piripiri.",
    });
    expect(list[0]).not.toHaveProperty("actionUrl");
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
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const eqSelect = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq: eqSelect });
    const eqUpdate = jest.fn().mockResolvedValue({ error: null });
    const update = jest.fn().mockReturnValue({ eq: eqUpdate });
    const eqDelete2 = jest.fn().mockResolvedValue({ error: null });
    const eqDelete = jest.fn().mockImplementation(() => ({
      ...Promise.resolve({ error: null }),
      then: (r: any) => Promise.resolve({ error: null }).then(r),
      eq: eqDelete2,
    }));
    const del = jest.fn().mockReturnValue({ eq: eqDelete });
    const insert = jest.fn().mockResolvedValue({ error: null });

    const from = jest.fn().mockImplementation((table: string) => {
      expect(table).toBe("v2_notifications");
      return { select, update, insert, delete: del };
    });

    const notifDs = new SupabaseNotificationDataSource(fakeClient({ from }));

    const list = await notifDs.listByUser("user-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("notif-1");
    expect(list[0].actionUrl).toBe("/negociacao/1");

    await expect(notifDs.markAsRead("notif-1")).resolves.toBeUndefined();
    await expect(notifDs.markAllAsRead("user-1")).resolves.toBeUndefined();
    await expect(notifDs.deleteNotification("notif-1")).resolves.toBeUndefined();
    await expect(notifDs.clearAll("user-1")).resolves.toBeUndefined();
    await expect(notifDs.clearRead("user-1")).resolves.toBeUndefined();
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
    const order = jest.fn().mockResolvedValue({ data: null, error });
    const eqSelect = jest.fn().mockReturnValue({ order });
    const select = jest.fn().mockReturnValue({ eq: eqSelect });
    const eqUpdate = jest.fn().mockResolvedValue({ error });
    const update = jest.fn().mockReturnValue({ eq: eqUpdate });
    const eqDelete2 = jest.fn().mockResolvedValue({ error });
    const eqDelete = jest.fn().mockImplementation(() => ({
      ...Promise.resolve({ error }),
      then: (r: any) => Promise.resolve({ error }).then(r),
      eq: eqDelete2,
    }));
    const del = jest.fn().mockReturnValue({ eq: eqDelete });
    const insert = jest.fn().mockResolvedValue({ error });

    const from = jest.fn().mockReturnValue({ select, update, insert, delete: del });
    const notifDs = new SupabaseNotificationDataSource(fakeClient({ from }));

    await expect(notifDs.listByUser("user-1")).rejects.toThrow("Não foi possível carregar as notificações.");
    await expect(notifDs.markAsRead("notif-1")).rejects.toThrow("Não foi possível atualizar a notificação.");
    await expect(notifDs.markAllAsRead("user-1")).rejects.toThrow("Não foi possível marcar as notificações como lidas.");
    await expect(notifDs.deleteNotification("notif-1")).rejects.toThrow("Não foi possível excluir a notificação.");
    await expect(notifDs.clearAll("user-1")).rejects.toThrow("Não foi possível limpar as notificações.");
    await expect(notifDs.clearRead("user-1")).rejects.toThrow("Não foi possível limpar as notificações lidas.");
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
