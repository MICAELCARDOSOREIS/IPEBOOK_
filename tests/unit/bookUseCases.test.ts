import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { DataSourceError } from "@/model/errors";
import { BookUseCases } from "@/usecase/bookUseCases";

describe("catálogo inicial", () => {
  it("inicia sem inventar livros", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    expect(await useCases.listBooks()).toEqual([]);
  });

  it("devolve os livros fornecidos pelo contrato", async () => {
    const books = [{ id: "1", title: "Livro de teste", author: "Autora de teste", ownerId: "owner-1", modality: "donation" as const, status: "available" as const }];
    const useCases = new BookUseCases({ list: async () => books });
    expect(await useCases.listBooks()).toEqual(books);
  });

  it("propaga erro de domínio para a ViewModel", async () => {
    const error = new DataSourceError("Catálogo indisponível.");
    const useCases = new BookUseCases({ list: async () => { throw error; } });
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
