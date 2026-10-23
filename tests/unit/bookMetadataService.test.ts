import { describe, expect, it, vi } from "vitest";
import { MemoryBookMetadataService } from "@/infra/services/memoryBookMetadataService";
import { OpenLibraryBookMetadataService } from "@/infra/services/openLibraryBookMetadataService";

describe("MemoryBookMetadataService (Spec 058)", () => {
  const service = new MemoryBookMetadataService();

  it("retorna metadados para ISBN cadastrado no seed", async () => {
    const book = await service.lookupByIsbn("978-85-359-1484-9");
    expect(book).not.toBeNull();
    expect(book?.title).toBe("Dom Casmurro");
    expect(book?.author).toBe("Machado de Assis");
    expect(book?.coverUrl).toBeDefined();
  });

  it("retorna null para ISBN não cadastrado", async () => {
    const book = await service.lookupByIsbn("978-00-000-0000-0");
    expect(book).toBeNull();
  });

  it("permite registrar novos exemplares dinamicamente", async () => {
    service.register({
      isbn: "9781234567890",
      title: "Livro de Teste",
      author: "Autor Teste",
    });
    const book = await service.lookupByIsbn("9781234567890");
    expect(book?.title).toBe("Livro de Teste");
  });
});

describe("OpenLibraryBookMetadataService (Spec 058)", () => {
  it("rejeita ISBN inválido antes de fazer fetch", async () => {
    const fetchSpy = vi.fn();
    const service = new OpenLibraryBookMetadataService(fetchSpy as any);
    const result = await service.lookupByIsbn("isbn-invalido");
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("retorna metadados ao obter resposta válida da API da Open Library", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        "ISBN:9788535914849": {
          title: "Dom Casmurro",
          authors: [{ name: "Machado de Assis" }],
          cover: { medium: "https://covers.openlibrary.org/b/id/123-M.jpg" },
        },
      }),
    };
    const fetchSpy = vi.fn().mockResolvedValue(mockResponse);
    const service = new OpenLibraryBookMetadataService(fetchSpy as any);

    const result = await service.lookupByIsbn("978-85-359-1484-9");
    expect(result).toEqual({
      isbn: "9788535914849",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      coverUrl: "https://covers.openlibrary.org/b/id/123-M.jpg",
    });
  });

  it("retorna null de forma resiliente em caso de falha de rede ou timeout", async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error("Network offline"));
    const service = new OpenLibraryBookMetadataService(fetchSpy as any);

    const result = await service.lookupByIsbn("978-85-359-1484-9");
    expect(result).toBeNull();
  });
});
