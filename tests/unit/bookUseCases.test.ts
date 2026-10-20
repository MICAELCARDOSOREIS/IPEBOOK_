import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { BookUseCases } from "@/usecase/bookUseCases";

function stubDataSource(overrides: Partial<IBookDataSource>): IBookDataSource {
  return {
    list: async () => [],
    create: async (b) => ({ ...b, id: "stub-id" }),
    findById: async () => null,
    updateStatus: async () => {
      throw new Error("não usado");
    },
    listByOwner: async () => [],
    delete: async () => {},
    update: async () => {
      throw new Error("não usado");
    },
    ...overrides,
  };
}

describe("catálogo inicial", () => {
  it("inicia sem inventar livros", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    expect(await useCases.listBooks()).toEqual([]);
  });

  it("devolve os livros fornecidos pelo contrato", async () => {
    const books = [{ id: "1", title: "Livro de teste", author: "Autora de teste", ownerId: "owner-1", modality: "donation" as const, status: "available" as const }];
    const useCases = new BookUseCases(stubDataSource({ list: async () => books }));
    expect(await useCases.listBooks()).toEqual(books);
  });

  it("propaga erro de domínio para a ViewModel", async () => {
    const error = new DataSourceError("Catálogo indisponível.");
    const useCases = new BookUseCases(stubDataSource({ list: async () => { throw error; } }));
    await expect(useCases.listBooks()).rejects.toBe(error);
  });

  it("isola a memória de alterações nos dados recebidos e devolvidos", async () => {
    const books = [{ id: "1", title: "Título original", author: "Autora", ownerId: "owner-1", modality: "trade" as const, status: "available" as const }];
    const source = new MemoryBookDataSource(books);
    books[0].title = "Alterado fora";
    const result = await source.list();
    Object.assign(result[0], { title: "Alterado no retorno" });
    expect((await source.list())[0].title).toBe("Título original");
  });

  it("suporta paginação com limit e offset no MemoryBookDataSource e repassa para o datasource (Issue #117)", async () => {
    const list = [
      { id: "1", title: "Livro 1", author: "A1", ownerId: "o1", modality: "donation" as const, status: "available" as const },
      { id: "2", title: "Livro 2", author: "A2", ownerId: "o1", modality: "donation" as const, status: "available" as const },
      { id: "3", title: "Livro 3", author: "A3", ownerId: "o1", modality: "donation" as const, status: "available" as const },
      { id: "4", title: "Livro 4", author: "A4", ownerId: "o1", modality: "donation" as const, status: "available" as const },
    ];
    const source = new MemoryBookDataSource(list);
    const useCases = new BookUseCases(source);

    const page1 = await useCases.listBooks({ limit: 2, offset: 0 });
    expect(page1).toHaveLength(2);
    expect(page1.map((b) => b.id)).toEqual(["1", "2"]);

    const page2 = await useCases.listBooks({ limit: 2, offset: 2 });
    expect(page2).toHaveLength(2);
    expect(page2.map((b) => b.id)).toEqual(["3", "4"]);
  });
});

describe("getBookById (FR-009 — detalhe do livro)", () => {
  it("retorna o livro quando o id existe", async () => {
    const book = { id: "1", title: "Livro de teste", author: "Autora de teste", ownerId: "owner-1", modality: "donation" as const, status: "available" as const };
    const useCases = new BookUseCases(stubDataSource({ findById: async (id) => (id === "1" ? book : null) }));

    await expect(useCases.getBookById("1")).resolves.toEqual(book);
  });

  it("lança erro de domínio tratável quando o id não existe", async () => {
    const useCases = new BookUseCases(stubDataSource({ findById: async () => null }));

    await expect(useCases.getBookById("inexistente")).rejects.toThrow(DataSourceError);
  });
});

describe("createListing (FR-006 — sessão obrigatória)", () => {
  it("bloqueia cadastro quando não há sessão autenticada", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(
      useCases.createListing(
        { title: "Livro", author: "Autor", modality: "donation" },
        null,
      ),
    ).rejects.toThrow(AuthError);
  });

  it("rejeita payload inválido mesmo com sessão", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(
      useCases.createListing(
        { title: "", author: "", modality: "sale" },
        "user-1",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("cria anúncio de doação com sucesso quando sessão e dados são válidos", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    const created = await useCases.createListing(
      { title: "Dom Casmurro", author: "Machado de Assis", modality: "donation" },
      "user-42",
    );

    expect(created.title).toBe("Dom Casmurro");
    expect(created.author).toBe("Machado de Assis");
    expect(created.ownerId).toBe("user-42");
    expect(created.modality).toBe("donation");
    expect(created.status).toBe("available");
    expect(created.id).toBeTruthy();

    const listed = await source.list();
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);
  });

  it("cria anúncio de venda exigindo preço maior que zero", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    await expect(
      useCases.createListing(
        { title: "Livro", author: "Autor Válido", modality: "sale" },
        "user-1",
      ),
    ).rejects.toThrow(ValidationError);

    const created = await useCases.createListing(
      { title: "Livro", author: "Autor Válido", modality: "sale", price: 29.90 },
      "user-1",
    );
    expect(created.modality).toBe("sale");
    expect(created.price).toBe(29.90);
  });

  it("cria anúncio de troca sem exigir preço", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    const created = await useCases.createListing(
      { title: "O Cortiço", author: "Aluísio Azevedo", modality: "trade" },
      "user-5",
    );

    expect(created.modality).toBe("trade");
    expect(created.price).toBeUndefined();
  });

  it("rejeita cadastro com cidade diferente de Piripiri", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    await expect(
      useCases.createListing(
        { title: "Livro de Fora", author: "Autor", modality: "donation", city: "Parnaíba" },
        "user-1",
      ),
    ).rejects.toThrow("O Ipebook está em fase beta exclusivamente em Piripiri, PI.");
  });

  it("persiste localidade de Piripiri, PI com bairro opcional no cadastro", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    const created = await useCases.createListing(
      {
        title: "Livro Comunitário",
        author: "Autor Local",
        modality: "trade",
        city: "Piripiri",
        state: "PI",
        neighborhood: "Paciência",
      },
      "user-1",
    );

    expect(created.city).toBe("Piripiri");
    expect(created.state).toBe("PI");
    expect(created.neighborhood).toBe("Paciência");
  });
});

describe("MemoryBookDataSource.create", () => {
  it("persiste o livro criado e o retorna com id gerado", async () => {
    const source = new MemoryBookDataSource();
    const created = await source.create({
      title: "Teste",
      author: "Autor",
      ownerId: "u1",
      modality: "donation",
      status: "available",
    });

    expect(created.id).toBeTruthy();
    expect(created.title).toBe("Teste");
    const all = await source.list();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(created.id);
  });

  it("isola a referência do livro criado", async () => {
    const source = new MemoryBookDataSource();
    const created = await source.create({
      title: "Original",
      author: "Autor",
      ownerId: "u1",
      modality: "trade",
      status: "available",
    });

    Object.assign(created, { title: "Mutado" });
    const all = await source.list();
    expect(all[0].title).toBe("Original");
  });
});

describe("updateListing (FR-024 — edição de anúncio)", () => {
  it("bloqueia edição quando não há sessão", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    await expect(
      useCases.updateListing("book-1", { title: "Novo Título" }, null),
    ).rejects.toThrow(AuthError);
  });

  it("bloqueia edição de anúncio inexistente", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    await expect(
      useCases.updateListing("inexistente", { title: "Novo Título" }, "user-1"),
    ).rejects.toThrow(DataSourceError);
  });

  it("bloqueia edição quando usuário não é o dono", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro 1", author: "Autor 1", modality: "donation" },
      "owner-1",
    );

    await expect(
      useCases.updateListing(book.id, { title: "Novo Título" }, "outro-user"),
    ).rejects.toThrow(AuthError);
  });

  it("bloqueia edição de anúncio reservado", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro 1", author: "Autor 1", modality: "donation" },
      "owner-1",
    );
    await source.updateStatus(book.id, "reserved");

    await expect(
      useCases.updateListing(book.id, { title: "Novo Título" }, "owner-1"),
    ).rejects.toThrow("Não é possível editar anúncio com negociação aceita em andamento.");
  });

  it("valida título e autor não vazios na edição", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro 1", author: "Autor 1", modality: "donation" },
      "owner-1",
    );

    await expect(
      useCases.updateListing(book.id, { title: "   " }, "owner-1"),
    ).rejects.toThrow(ValidationError);
    await expect(
      useCases.updateListing(book.id, { author: "" }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("valida preço positivo quando a modalidade for sale", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro 1", author: "Autor 1", modality: "donation" },
      "owner-1",
    );

    await expect(
      useCases.updateListing(book.id, { modality: "sale", price: 0 }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("valida restrição de cidade em Piripiri", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro 1", author: "Autor 1", modality: "donation" },
      "owner-1",
    );

    await expect(
      useCases.updateListing(book.id, { city: "Teresina" }, "owner-1"),
    ).rejects.toThrow("O Ipebook está em fase beta exclusivamente em Piripiri, PI.");
  });

  it("atualiza anúncio com sucesso e reflete nos dados", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro Antigo", author: "Autor Antigo", modality: "donation" },
      "owner-1",
    );

    const updated = await useCases.updateListing(
      book.id,
      {
        title: "Livro Atualizado",
        author: "Novo Autor",
        modality: "sale",
        price: 25.5,
        neighborhood: "Floresta",
      },
      "owner-1",
    );

    expect(updated.title).toBe("Livro Atualizado");
    expect(updated.author).toBe("Novo Autor");
    expect(updated.modality).toBe("sale");
    expect(updated.price).toBe(25.5);
    expect(updated.neighborhood).toBe("Floresta");

    const fetched = await useCases.getBookById(book.id);
    expect(fetched.title).toBe("Livro Atualizado");
  });
});

describe("togglePauseListing (FR-024 — pausar e retomar anúncio)", () => {
  it("bloqueia pausar sem sessão autenticada", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    await expect(useCases.togglePauseListing("id-1", null)).rejects.toThrow(AuthError);
  });

  it("bloqueia pausar se não for o dono", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro", author: "Autor", modality: "trade" },
      "owner-1",
    );

    await expect(useCases.togglePauseListing(book.id, "invasor")).rejects.toThrow(AuthError);
  });

  it("bloqueia pausar anúncio reservado", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro", author: "Autor", modality: "trade" },
      "owner-1",
    );
    await source.updateStatus(book.id, "reserved");

    await expect(useCases.togglePauseListing(book.id, "owner-1")).rejects.toThrow(
      "Não é possível alterar o status de anúncio com negociação aceita.",
    );
  });

  it("pausa anúncio disponível e o oculta do catálogo público mantendo nos meus anúncios", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro Ativo", author: "Autor", modality: "trade" },
      "owner-1",
    );

    expect((await useCases.listBooks())).toHaveLength(1);

    const paused = await useCases.togglePauseListing(book.id, "owner-1");
    expect(paused.status).toBe("paused");

    // Catálogo público não lista pausados
    expect((await useCases.listBooks())).toHaveLength(0);

    // listByOwner lista pausados normalmente
    const ownerBooks = await useCases.listMyListings("owner-1");
    expect(ownerBooks).toHaveLength(1);
    expect(ownerBooks[0].status).toBe("paused");
  });

  it("retoma anúncio pausado e o restaura no catálogo público", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const book = await useCases.createListing(
      { title: "Livro Pausado", author: "Autor", modality: "trade" },
      "owner-1",
    );
    await useCases.togglePauseListing(book.id, "owner-1");

    const resumed = await useCases.togglePauseListing(book.id, "owner-1");
    expect(resumed.status).toBe("available");

    expect((await useCases.listBooks())).toHaveLength(1);
    expect((await useCases.listBooks())[0].id).toBe(book.id);
  });
});

describe("Spec 028 — conservação e descrição no anúncio", () => {
  it("guarda conservação e descrição sanitizadas ao criar", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    const created = await useCases.createListing(
      {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        modality: "donation",
        condition: "marked",
        description: "  Marcas leves de uso  ",
        neighborhood: "Centro",
      },
      "user-42",
    );

    expect(created.condition).toBe("marked");
    expect(created.description).toBe("Marcas leves de uso");
  });

  it("recusa conservação fora da lista ao criar", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());

    await expect(
      useCases.createListing(
        {
          title: "Dom Casmurro",
          author: "Machado de Assis",
          modality: "donation",
          condition: "antigo" as never,
        },
        "user-42",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("recusa descrição acima do limite ao criar", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());

    await expect(
      useCases.createListing(
        {
          title: "Dom Casmurro",
          author: "Machado de Assis",
          modality: "donation",
          description: "a".repeat(281),
        },
        "user-42",
      ),
    ).rejects.toThrow(ValidationError);
  });

  it("altera conservação e descrição ao editar e preserva o que não foi enviado", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const created = await useCases.createListing(
      {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        modality: "donation",
        condition: "good",
        description: "Capa original",
      },
      "user-42",
    );

    const alterado = await useCases.updateListing(
      created.id,
      { condition: "worn", description: "Páginas amareladas" },
      "user-42",
    );
    expect(alterado.condition).toBe("worn");
    expect(alterado.description).toBe("Páginas amareladas");

    const semMudanca = await useCases.updateListing(created.id, { title: "Dom Casmurro II" }, "user-42");
    expect(semMudanca.condition).toBe("worn");
    expect(semMudanca.description).toBe("Páginas amareladas");
  });

  it("limpa a descrição quando ela é enviada vazia", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const created = await useCases.createListing(
      {
        title: "Dom Casmurro",
        author: "Machado de Assis",
        modality: "donation",
        description: "Capa original",
      },
      "user-42",
    );

    const limpo = await useCases.updateListing(created.id, { description: "" }, "user-42");
    expect(limpo.description).toBeUndefined();
  });
});
