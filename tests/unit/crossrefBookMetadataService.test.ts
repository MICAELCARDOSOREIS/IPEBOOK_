import { describe, expect, it, vi } from "vitest";
import { CrossrefBookMetadataService } from "@/infra/services/crossrefBookMetadataService";

const ISBN13 = "9788497451703";
const ISBN10 = "8497451708";
const ISBN_INVALIDO = "1234567890";

function mockFetch(status: number, data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}

describe("CrossrefBookMetadataService (Spec 092/097)", () => {
  it("extrai título, autor, editora e ano de publicação com sucesso", async () => {
    const fetchMock = mockFetch(200, {
      status: "ok",
      message: {
        items: [
          {
            title: ["Fundamentos de calculo de costes"],
            author: [
              { given: "Manuel", family: "Carneiro Caneda" },
              { given: "Maria Luisa", family: "Delgado Jalon" },
            ],
            publisher: "Netbiblo",
            published: {
              "date-parts": [[2007, 5]],
            },
            abstract: "<jats:p>Manual prático de contabilidade de custos.</jats:p>",
          },
        ],
      },
    });

    const service = new CrossrefBookMetadataService(fetchMock as never);
    const result = await service.lookupByIsbn(ISBN13);

    expect(result).toEqual({
      isbn: ISBN13,
      title: "Fundamentos de calculo de costes",
      author: "Manuel Carneiro Caneda",
      publisher: "Netbiblo",
      publicationYear: 2007,
      synopsis: "Manual prático de contabilidade de custos.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.crossref.org/works?filter=isbn:${ISBN13}&rows=1`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
        }),
      }),
    );
  });

  it("aceita ISBN-10 válido e converte/normaliza", async () => {
    const fetchMock = mockFetch(200, {
      status: "ok",
      message: {
        items: [
          {
            title: ["Livro Teste"],
            author: [{ given: "Alan", family: "Turing" }],
          },
        ],
      },
    });

    const service = new CrossrefBookMetadataService(fetchMock as never);
    const result = await service.lookupByIsbn(ISBN10);

    expect(result).toMatchObject({
      isbn: ISBN10,
      title: "Livro Teste",
      author: "Alan Turing",
    });
  });

  it("devolve 'Autor desconhecido' quando não houver lista de autores", async () => {
    const fetchMock = mockFetch(200, {
      status: "ok",
      message: {
        items: [
          {
            title: ["Dicionário Técnico"],
          },
        ],
      },
    });

    const service = new CrossrefBookMetadataService(fetchMock as never);
    const result = await service.lookupByIsbn(ISBN13);

    expect(result?.author).toBe("Autor desconhecido");
  });

  it("retorna null para ISBN inválido sem disparar requisição", async () => {
    const fetchMock = vi.fn();
    const service = new CrossrefBookMetadataService(fetchMock as never);
    const result = await service.lookupByIsbn(ISBN_INVALIDO);

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("retorna null quando a API responder com erro HTTP ou sem itens", async () => {
    const fetch404 = mockFetch(404, { status: "not-found" });
    const service404 = new CrossrefBookMetadataService(fetch404 as never);
    expect(await service404.lookupByIsbn(ISBN13)).toBeNull();

    const fetchVazio = mockFetch(200, { status: "ok", message: { items: [] } });
    const serviceVazio = new CrossrefBookMetadataService(fetchVazio as never);
    expect(await serviceVazio.lookupByIsbn(ISBN13)).toBeNull();
  });

  it("ignora falha de rede ou timeout e retorna null com segurança", async () => {
    const fetchErro = vi.fn().mockRejectedValue(new Error("Timeout de rede"));
    const service = new CrossrefBookMetadataService(fetchErro as never);
    const result = await service.lookupByIsbn(ISBN13);

    expect(result).toBeNull();
  });
});
