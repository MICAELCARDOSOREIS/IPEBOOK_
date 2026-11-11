import type { BookMetadata } from "@/model/entities/bookMetadata";
import { isValidIsbn, normalizeIsbn } from "@/model/isbn";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const TIMEOUT_MS = 5000;

type CrossrefWorkItem = {
  title?: unknown[];
  author?: Array<{ given?: string; family?: string }>;
  publisher?: string;
  published?: { "date-parts"?: number[][] };
  issued?: { "date-parts"?: number[][] };
  abstract?: string;
};

type CrossrefResponse = {
  status?: string;
  message?: {
    items?: CrossrefWorkItem[];
  };
};

/**
 * Consulta a base global do Crossref (Spec 092/097 / ADR 0073).
 * Base pública e gratuita com milhões de publicações acadêmicas, livros didáticos e universitários.
 */
export class CrossrefBookMetadataService implements IBookMetadataService {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async lookupByIsbn(rawIsbn: string): Promise<BookMetadata | null> {
    const clean = normalizeIsbn(rawIsbn);
    if (!isValidIsbn(clean)) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = `https://api.crossref.org/works?filter=isbn:${encodeURIComponent(clean)}&rows=1`;
      const response = await this.fetchFn(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "IpeBook/1.0 (https://ipebook.app; mailto:contato@ipebook.app)",
        },
      });

      if (!response.ok) return null;

      const data = (await response.json()) as CrossrefResponse;
      const item = data?.message?.items?.[0];
      if (!item) return null;

      const title = Array.isArray(item.title) && typeof item.title[0] === "string"
        ? item.title[0].trim()
        : undefined;
      if (!title) return null;

      let author = "Autor desconhecido";
      if (Array.isArray(item.author) && item.author.length > 0) {
        const first = item.author[0];
        const nameParts = [first.given, first.family].filter((part) => typeof part === "string" && part.trim().length > 0);
        if (nameParts.length > 0) {
          author = nameParts.join(" ").trim();
        }
      }

      const publisher = typeof item.publisher === "string" && item.publisher.trim().length > 0
        ? item.publisher.trim()
        : undefined;

      let publicationYear: number | undefined;
      const dateParts = item.published?.["date-parts"]?.[0] ?? item.issued?.["date-parts"]?.[0];
      if (Array.isArray(dateParts) && typeof dateParts[0] === "number") {
        const year = dateParts[0];
        if (year >= 1000 && year <= 2100) {
          publicationYear = year;
        }
      }

      let synopsis: string | undefined;
      if (typeof item.abstract === "string" && item.abstract.trim().length > 0) {
        const cleanAbstract = item.abstract.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanAbstract) {
          synopsis = cleanAbstract;
        }
      }

      return {
        isbn: clean,
        title,
        author,
        ...(publisher ? { publisher } : {}),
        ...(publicationYear ? { publicationYear } : {}),
        ...(synopsis ? { synopsis } : {}),
      };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
