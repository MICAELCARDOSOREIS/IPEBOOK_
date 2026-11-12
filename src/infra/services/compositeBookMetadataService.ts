import type { BookMetadata } from "@/model/entities/bookMetadata";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const UNKNOWN_AUTHOR = "Autor desconhecido";

/**
 * Consulta as duas fontes ao mesmo tempo e junta o melhor de cada uma (Spec 092): título e autor reais
 * (a Open Library às vezes devolve "Autor desconhecido") e a capa de maior resolução.
 */
export class CompositeBookMetadataService implements IBookMetadataService {
  constructor(private readonly sources: readonly IBookMetadataService[]) {}

  async lookupByIsbn(isbn: string): Promise<BookMetadata | null> {
    const results = (await Promise.all(this.sources.map((source) => source.lookupByIsbn(isbn).catch(() => null)))).filter(
      (item): item is BookMetadata => item !== null,
    );
    if (results.length === 0) return null;

    const [first] = results;
    const knownAuthor = results.find((item) => item.author && item.author !== UNKNOWN_AUTHOR);
    // Capa grande da primeira fonte que tiver; senão a pequena de quem tiver alguma.
    const cover = results.find((item) => item.coverUrl && item.coverIsLarge) ?? results.find((item) => item.coverUrl);

    // Dados da edição (Spec 097): pega de quem tiver, na ordem das fontes.
    const edition = <K extends "synopsis" | "publisher" | "pageCount" | "publicationYear">(key: K) =>
      results.find((item) => item[key] !== undefined)?.[key];
    const synopsis = edition("synopsis");
    const publisher = edition("publisher");
    const pageCount = edition("pageCount");
    const publicationYear = edition("publicationYear");

    return {
      isbn: first.isbn,
      title: first.title,
      author: knownAuthor?.author ?? first.author,
      coverUrl: cover?.coverUrl,
      ...(cover?.coverIsLarge ? { coverIsLarge: true } : {}),
      ...(synopsis ? { synopsis } : {}),
      ...(publisher ? { publisher } : {}),
      ...(pageCount ? { pageCount } : {}),
      ...(publicationYear ? { publicationYear } : {}),
    };
  }
}
