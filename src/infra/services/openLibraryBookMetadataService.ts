import type { BookMetadata } from "@/model/entities/bookMetadata";
import { isValidIsbn, normalizeIsbn } from "@/model/isbn";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const TIMEOUT_MS = 5000;

/** Capas `http://` são bloqueadas no Android e na web; troca por `https://`. */
export function toHttps(url: string | undefined): string | undefined {
  return url ? url.replace(/^http:\/\//i, "https://") : undefined;
}

export class OpenLibraryBookMetadataService implements IBookMetadataService {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async lookupByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
    const clean = normalizeIsbn(rawIsbn);
    if (!isValidIsbn(clean)) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const bibkey = `ISBN:${clean}`;
      const url = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(
        bibkey,
      )}&format=json&jscmd=data`;

      const response = await this.fetchFn(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) return null;

      const json = await response.json();
      const bookData = json[bibkey];
      if (!bookData || !bookData.title) return null;

      const author = Array.isArray(bookData.authors) && bookData.authors.length > 0
        ? bookData.authors[0].name
        : "Autor desconhecido";

      // Prefere a capa grande: a média tinha cerca de 180 px e ficava pixelada no detalhe do livro.
      const large = typeof bookData.cover?.large === "string" ? bookData.cover.large : undefined;
      const coverUrl = toHttps(large ?? bookData.cover?.medium ?? undefined);

      return {
        isbn: clean,
        title: String(bookData.title).trim(),
        author: String(author).trim(),
        coverUrl,
        ...(large ? { coverIsLarge: true } : {}),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
