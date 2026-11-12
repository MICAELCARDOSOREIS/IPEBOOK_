import { describe, expect, it, vi } from "vitest";
import { BrasilApiBookMetadataService } from "@/infra/services/brasilApiBookMetadataService";
import { CompositeBookMetadataService } from "@/infra/services/compositeBookMetadataService";
import type { BookMetadata } from "@/model/entities/bookMetadata";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const ISBN = "9788535914849";

function respond(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: async () => body });
}

describe("BrasilApiBookMetadataService (Spec 097, ADR 0073)", () => {
  it("rejeita ISBN inválido antes de fazer a chamada", async () => {
    const fetchFn = vi.fn();
    expect(await new BrasilApiBookMetadataService(fetchFn as never).lookupByIsbn("abc")).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("traz título, só o primeiro autor (sem tradutores), editora, páginas, ano e sinopse limpa", async () => {
    const fetchFn = respond({
      title: " 1984 ",
      authors: ["George Orwell", "Alexandre Hubner", "Heloisa Jahn"],
      publisher: "Companhia das Letras",
      year: 2009,
      page_count: 416,
      synopsis: "Publicada em 1949,\n  a distopia   futurista.",
      cover_url: "http://exemplo.com/capa.jpg",
    });
    const meta = await new BrasilApiBookMetadataService(fetchFn as never).lookupByIsbn("978-85-359-1484-9");
    expect(fetchFn).toHaveBeenCalledWith(`https://brasilapi.com.br/api/isbn/v1/${ISBN}`, expect.objectContaining({ headers: { Accept: "application/json" } }));
    expect(meta).toEqual({
      isbn: ISBN,
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://exemplo.com/capa.jpg",
      synopsis: "Publicada em 1949, a distopia futurista.",
      publisher: "Companhia das Letras",
      pageCount: 416,
      publicationYear: 2009,
    });
  });

  it("sem autor, usa 'Autor desconhecido'; ignora campos vazios, zerados ou absurdos", async () => {
    const meta = await new BrasilApiBookMetadataService(
      respond({ title: "Nisekoi - V. 9", authors: [], publisher: "Panini Brasil", year: null, page_count: 0, synopsis: "  ", cover_url: null }) as never,
    ).lookupByIsbn("9788542617702");
    expect(meta).toEqual({ isbn: "9788542617702", title: "Nisekoi - V. 9", author: "Autor desconhecido", publisher: "Panini Brasil" });
    const absurd = await new BrasilApiBookMetadataService(respond({ title: "X", authors: ["A"], page_count: 999999, year: 3000 }) as never).lookupByIsbn(ISBN);
    expect(absurd).toEqual({ isbn: ISBN, title: "X", author: "A" });
  });

  it("sem título, com erro de rede ou de servidor, devolve null", async () => {
    expect(await new BrasilApiBookMetadataService(respond({ authors: ["A"] }) as never).lookupByIsbn(ISBN)).toBeNull();
    expect(await new BrasilApiBookMetadataService(respond({}, false) as never).lookupByIsbn(ISBN)).toBeNull();
    expect(await new BrasilApiBookMetadataService(vi.fn().mockRejectedValue(new Error("rede")) as never).lookupByIsbn(ISBN)).toBeNull();
  });
});

describe("CompositeBookMetadataService com dados da edição (Spec 097)", () => {
  const fonte = (meta: BookMetadata | null): IBookMetadataService => ({ lookupByIsbn: async () => meta });

  it("junta capa de uma fonte com sinopse, editora, páginas e ano de outra", async () => {
    const composta = new CompositeBookMetadataService([
      fonte({ isbn: ISBN, title: "1984", author: "Autor desconhecido", coverUrl: "https://capa/g.jpg", coverIsLarge: true }),
      fonte({ isbn: ISBN, title: "1984", author: "George Orwell", synopsis: "Distopia.", publisher: "Cia das Letras", pageCount: 416, publicationYear: 2009 }),
    ]);
    expect(await composta.lookupByIsbn(ISBN)).toEqual({
      isbn: ISBN,
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://capa/g.jpg",
      coverIsLarge: true,
      synopsis: "Distopia.",
      publisher: "Cia das Letras",
      pageCount: 416,
      publicationYear: 2009,
    });
  });

  it("acha edições que só a base brasileira tem, e uma fonte fora do ar não impede as outras", async () => {
    const quebrada: IBookMetadataService = { lookupByIsbn: async () => { throw new Error("fora do ar"); } };
    const composta = new CompositeBookMetadataService([fonte(null), quebrada, fonte({ isbn: ISBN, title: "Nisekoi - V. 9", author: "Autor desconhecido", publisher: "Panini Brasil" })]);
    expect(await composta.lookupByIsbn(ISBN)).toMatchObject({ title: "Nisekoi - V. 9", publisher: "Panini Brasil" });
    expect(await new CompositeBookMetadataService([fonte(null)]).lookupByIsbn(ISBN)).toBeNull();
  });
});
