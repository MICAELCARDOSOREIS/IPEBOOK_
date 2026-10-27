import { describe, expect, it, vi } from "vitest";
import type { BookMetadata } from "@/model/entities/bookMetadata";
import { CompositeBookMetadataService } from "@/infra/services/compositeBookMetadataService";
import { GoogleBooksBookMetadataService, largeGoogleCover } from "@/infra/services/googleBooksBookMetadataService";
import { OpenLibraryBookMetadataService, toHttps } from "@/infra/services/openLibraryBookMetadataService";

const ISBN = "9788535914849";
const ok = (body: unknown) => vi.fn().mockResolvedValue({ ok: true, json: async () => body });

describe("capas do ISBN (Spec 092)", () => {
  it("Open Library prefere a capa grande e força https", async () => {
    const fetchFn = ok({ [`ISBN:${ISBN}`]: { title: "Dom Casmurro", authors: [{ name: "Machado" }], cover: { medium: "http://c/m.jpg", large: "http://c/l.jpg" } } });
    const result = await new OpenLibraryBookMetadataService(fetchFn as never).lookupByIsbn(ISBN);
    expect(result).toMatchObject({ coverUrl: "https://c/l.jpg", coverIsLarge: true });
    const onlyMedium = ok({ [`ISBN:${ISBN}`]: { title: "X", cover: { medium: "http://c/m.jpg" } } });
    const medium = await new OpenLibraryBookMetadataService(onlyMedium as never).lookupByIsbn(ISBN);
    expect(medium?.coverUrl).toBe("https://c/m.jpg");
    expect(medium?.coverIsLarge).toBeUndefined();
    expect(toHttps(undefined)).toBeUndefined();
  });

  it("Google Books devolve título, autor e capa ampliada sem a dobra de página", async () => {
    const thumb = "http://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api";
    const fetchFn = ok({ items: [{ volumeInfo: { title: " Capitães da Areia ", authors: ["Jorge Amado"], imageLinks: { thumbnail: thumb } } }] });
    const result = await new GoogleBooksBookMetadataService(fetchFn as never).lookupByIsbn(ISBN);
    expect(result).toMatchObject({ title: "Capitães da Areia", author: "Jorge Amado", coverIsLarge: true });
    expect(result?.coverUrl).toBe("https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=3&source=gbs_api");
    expect(largeGoogleCover(undefined)).toBeUndefined();
  });

  it("Google Books trata ISBN inválido, resposta vazia, sem capa, sem autor e falha de rede", async () => {
    const never = vi.fn();
    expect(await new GoogleBooksBookMetadataService(never as never).lookupByIsbn("abc")).toBeNull();
    expect(never).not.toHaveBeenCalled();
    expect(await new GoogleBooksBookMetadataService(ok({ totalItems: 0 }) as never).lookupByIsbn(ISBN)).toBeNull();
    expect(await new GoogleBooksBookMetadataService(vi.fn().mockResolvedValue({ ok: false }) as never).lookupByIsbn(ISBN)).toBeNull();
    expect(await new GoogleBooksBookMetadataService(vi.fn().mockRejectedValue(new Error("rede")) as never).lookupByIsbn(ISBN)).toBeNull();
    const bare = await new GoogleBooksBookMetadataService(ok({ items: [{ volumeInfo: { title: "Sem capa" } }] }) as never).lookupByIsbn(ISBN);
    expect(bare).toMatchObject({ title: "Sem capa", author: "Autor desconhecido", coverUrl: undefined });
    expect(bare?.coverIsLarge).toBeUndefined();
  });

  const source = (value: BookMetadata | null | Error) => ({
    lookupByIsbn: value instanceof Error ? vi.fn().mockRejectedValue(value) : vi.fn().mockResolvedValue(value),
  });

  it("composto junta autor real e a capa de maior resolução", async () => {
    const ol: BookMetadata = { isbn: ISBN, title: "Dom Casmurro", author: "Autor desconhecido", coverUrl: "https://ol/m.jpg" };
    const gb: BookMetadata = { isbn: ISBN, title: "Dom Casmurro (GB)", author: "Machado de Assis", coverUrl: "https://gb/z3.jpg", coverIsLarge: true };
    const result = await new CompositeBookMetadataService([source(ol), source(gb)]).lookupByIsbn(ISBN);
    expect(result).toEqual({ isbn: ISBN, title: "Dom Casmurro", author: "Machado de Assis", coverUrl: "https://gb/z3.jpg", coverIsLarge: true });
  });

  it("composto usa a capa pequena quando é a única, e a única fonte que respondeu", async () => {
    const ol: BookMetadata = { isbn: ISBN, title: "A", author: "B", coverUrl: "https://ol/m.jpg" };
    expect((await new CompositeBookMetadataService([source(ol), source(null)]).lookupByIsbn(ISBN))?.coverUrl).toBe("https://ol/m.jpg");
    expect((await new CompositeBookMetadataService([source(new Error("x")), source(ol)]).lookupByIsbn(ISBN))?.title).toBe("A");
    expect(await new CompositeBookMetadataService([source(null), source(new Error("y"))]).lookupByIsbn(ISBN)).toBeNull();
  });
});
