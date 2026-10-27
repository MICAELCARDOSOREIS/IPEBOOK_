import type { BookMetadata } from "@/model/entities/bookMetadata";
import { isValidIsbn, normalizeIsbn } from "@/model/isbn";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import { toHttps } from "@/infra/services/openLibraryBookMetadataService";

const TIMEOUT_MS = 5000;

/** A miniatura padrão do Google Books é pequena; `zoom=3` pede a capa maior e sem a dobra de página (`edge=curl`). */
export function largeGoogleCover(url: string | undefined): string | undefined {
  const https = toHttps(url);
  if (!https) return undefined;
  return https.replace(/([?&])zoom=\d/, "$1zoom=3").replace(/&edge=curl/, "");
}

/**
 * Segunda fonte de dados do ISBN (Spec 092): a Open Library conhece poucos títulos brasileiros e quase
 * nenhuma capa deles; o Google Books costuma ter ambos.
 */
export class GoogleBooksBookMetadataService implements IBookMetadataService {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async lookupByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
    const clean = normalizeIsbn(rawIsbn);
    if (!isValidIsbn(clean)) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await this.fetchFn(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(clean)}&maxResults=1`,
        { signal: controller.signal, headers: { Accept: "application/json" } },
      );
      if (!response.ok) return null;

      const json = await response.json();
      const info = json?.items?.[0]?.volumeInfo;
      if (!info?.title) return null;

      const author = Array.isArray(info.authors) && info.authors.length > 0 ? String(info.authors[0]) : "Autor desconhecido";
      const links = info.imageLinks ?? {};
      const coverUrl = largeGoogleCover(links.thumbnail ?? links.smallThumbnail);

      return {
        isbn: clean,
        title: String(info.title).trim(),
        author: author.trim(),
        coverUrl,
        ...(coverUrl ? { coverIsLarge: true } : {}),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
