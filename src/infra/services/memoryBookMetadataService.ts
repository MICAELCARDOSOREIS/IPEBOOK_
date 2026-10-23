import type { BookMetadata } from "@/model/entities/bookMetadata";
import { normalizeIsbn } from "@/model/isbn";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";

const DEFAULT_METADATA_SEED: Record<string, BookMetadata> = {
  "9788535914849": {
    isbn: "9788535914849",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788535914849-M.jpg",
  },
  "9788508114320": {
    isbn: "9788508114320",
    title: "O Cortiço",
    author: "Aluísio Azevedo",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788508114320-M.jpg",
  },
  "9788532530783": {
    isbn: "9788532530783",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788532530783-M.jpg",
  },
  "9788535902778": {
    isbn: "9788535902778",
    title: "Vidas Secas",
    author: "Graciliano Ramos",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788535902778-M.jpg",
  },
  "9788520926475": {
    isbn: "9788520926475",
    title: "A Hora da Estrela",
    author: "Clarice Lispector",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9788520926475-M.jpg",
  },
};

export class MemoryBookMetadataService implements IBookMetadataService {
  private items = new Map<string, BookMetadata>();

  constructor(initialSeed: Record<string, BookMetadata> = DEFAULT_METADATA_SEED) {
    for (const [isbn, meta] of Object.entries(initialSeed)) {
      this.items.set(normalizeIsbn(isbn), meta);
    }
  }

  async lookupByIsbn(isbn: string): Promise<BookMetadata | null> {
    const clean = normalizeIsbn(isbn);
    if (!clean) return null;
    return this.items.get(clean) ?? null;
  }

  register(metadata: BookMetadata): void {
    this.items.set(normalizeIsbn(metadata.isbn), metadata);
  }

  clear(): void {
    this.items.clear();
  }
}
