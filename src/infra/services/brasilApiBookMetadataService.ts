import type { BookMetadata } from "@/model/entities/bookMetadata";
import { isValidIsbn, normalizeIsbn } from "@/model/isbn";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const TIMEOUT_MS = 6000;

type BrasilApiIsbn = {
  title?: unknown;
  authors?: unknown;
  publisher?: unknown;
  year?: unknown;
  page_count?: unknown;
  synopsis?: unknown;
  cover_url?: unknown;
};

const text = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  // A sinopse às vezes vem com quebras de linha e espaços repetidos.
  const clean = value.replace(/\s+/g, " ").trim();
  return clean || undefined;
};

const positiveInt = (value: unknown, max: number): number | undefined => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n > 0 && n <= max ? n : undefined;
};

/**
 * Base brasileira de ISBN (Câmara Brasileira do Livro, pela BrasilAPI): acha edições nacionais que a Open Library
 * não tem e traz editora, ano, páginas e sinopse (Spec 097, ADR 0073). Não traz capa. A lista de autores às vezes
 * inclui tradutores; só o primeiro nome é usado.
 */
export class BrasilApiBookMetadataService implements IBookMetadataService {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async lookupByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
    const clean = normalizeIsbn(rawIsbn);
    if (!isValidIsbn(clean)) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await this.fetchFn(`https://brasilapi.com.br/api/isbn/v1/${clean}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return null;

      const data = (await response.json()) as BrasilApiIsbn;
      const title = text(data.title);
      if (!title) return null;

      const firstAuthor = Array.isArray(data.authors) ? text(data.authors[0]) : undefined;
      const synopsis = text(data.synopsis);
      const publisher = text(data.publisher);
      const pageCount = positiveInt(data.page_count, 20000);
      const publicationYear = positiveInt(data.year, 2100);
      const coverUrl = text(data.cover_url)?.replace(/^http:\/\//i, "https://");

      return {
        isbn: clean,
        title,
        author: firstAuthor ?? "Autor desconhecido",
        ...(coverUrl ? { coverUrl } : {}),
        ...(synopsis ? { synopsis } : {}),
        ...(publisher ? { publisher } : {}),
        ...(pageCount ? { pageCount } : {}),
        ...(publicationYear ? { publicationYear } : {}),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
