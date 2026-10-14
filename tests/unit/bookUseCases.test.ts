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
