import type { Book, BookModality } from "@/model/entities/book";

export type BookValidationResult = Readonly<{
  isValid: boolean;
  errors: readonly string[];
}>;

const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 150;
const MIN_AUTHOR_LENGTH = 2;
const MAX_AUTHOR_LENGTH = 100;

const VALID_MODALITIES: readonly BookModality[] = ["sale", "trade", "donation"];

export function sanitizeBookInput(input: Partial<Book>): Partial<Book> {
  return {
    id: input.id?.trim(),
    title: input.title?.trim(),
    author: input.author?.trim(),
    ownerId: input.ownerId?.trim(),
    modality: input.modality,
    price: input.price,
  };
}

export function validateBookPayload(input: unknown): BookValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: ["Dados do livro inválidos ou não fornecidos."],
    };
  }

  const raw = input as Record<string, unknown>;

  if (typeof raw.id !== "string" || raw.id.trim().length === 0) {
    errors.push("Identificador do livro é obrigatório.");
  }

  if (typeof raw.title !== "string" || raw.title.trim().length === 0) {
    errors.push("Título do livro é obrigatório.");
  } else {
    const trimmedTitle = raw.title.trim();
    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      errors.push(`Título deve conter no mínimo ${MIN_TITLE_LENGTH} caracteres.`);
    } else if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      errors.push(`Título deve conter no máximo ${MAX_TITLE_LENGTH} caracteres.`);
    }
  }

  if (typeof raw.author !== "string" || raw.author.trim().length === 0) {
    errors.push("Autor do livro é obrigatório.");
  } else {
    const trimmedAuthor = raw.author.trim();
    if (trimmedAuthor.length < MIN_AUTHOR_LENGTH) {
      errors.push(`Autor deve conter no mínimo ${MIN_AUTHOR_LENGTH} caracteres.`);
    } else if (trimmedAuthor.length > MAX_AUTHOR_LENGTH) {
      errors.push(`Autor deve conter no máximo ${MAX_AUTHOR_LENGTH} caracteres.`);
    }
  }

  if (typeof raw.ownerId !== "string" || raw.ownerId.trim().length === 0) {
    errors.push("Identificador do dono é obrigatório.");
  }

  if (!VALID_MODALITIES.includes(raw.modality as BookModality)) {
    errors.push("Modalidade deve ser 'sale', 'trade' ou 'donation'.");
  }

  if (raw.modality === "sale") {
    if (typeof raw.price !== "number" || raw.price <= 0) {
      errors.push("Preço é obrigatório e deve ser maior que zero para modalidade de venda.");
    }
  } else if (raw.price !== undefined && raw.price !== null) {
    if (typeof raw.price !== "number" || raw.price < 0) {
      errors.push("Preço, quando informado, deve ser um número não negativo.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatBookDisplay(book: Pick<Book, "title" | "author">): string {
  const title = book.title?.trim() || "Sem título";
  const author = book.author?.trim() || "Autor desconhecido";
  return `${title} — ${author}`;
}
