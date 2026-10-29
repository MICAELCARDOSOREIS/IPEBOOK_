import type { Book, BookCondition, BookModality } from "@/model/entities/book";
import { BOOK_CONDITIONS, MAX_BOOK_DESCRIPTION_LENGTH } from "@/model/entities/book";
import { isValidBetaLocation } from "@/model/entities/location";

export type BookValidationResult = Readonly<{
  isValid: boolean;
  errors: readonly string[];
}>;

const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 150;
const MIN_AUTHOR_LENGTH = 2;
const MAX_AUTHOR_LENGTH = 100;

const VALID_MODALITIES: readonly BookModality[] = ["sale", "trade", "donation"];

const MAX_PHOTOS = 5;
const MAX_PHOTO_URL_LENGTH = 2048;

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeBookInput(input: Partial<Book>): Partial<Book> {
  return {
    id: input.id?.trim(),
    title: input.title?.trim(),
    author: input.author?.trim(),
    category: input.category?.trim(),
    ownerId: input.ownerId?.trim(),
    modality: input.modality,
    price: input.price,
    city: input.city?.trim(),
    state: input.state?.trim(),
    neighborhood: input.neighborhood?.trim(),
    condition: input.condition,
    description: input.description?.trim() || undefined,
    photoUrl: input.photoUrl?.trim() || undefined,
    photos: Array.isArray(input.photos)
      ? input.photos.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean)
      : undefined,
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

  if (raw.category !== undefined && raw.category !== null &&
    (typeof raw.category !== "string" || raw.category.trim().length > 60)) {
    errors.push("Categoria deve ter no máximo 60 caracteres.");
  }

  if (raw.condition !== undefined && raw.condition !== null &&
    !BOOK_CONDITIONS.includes(raw.condition as BookCondition)) {
    errors.push("Estado de conservação deve ser 'new', 'good', 'marked' ou 'worn'.");
  }

  if (raw.description !== undefined && raw.description !== null) {
    if (typeof raw.description !== "string") {
      errors.push("Descrição deve ser um texto válido.");
    } else if (raw.description.trim().length > MAX_BOOK_DESCRIPTION_LENGTH) {
      errors.push(`Descrição deve conter no máximo ${MAX_BOOK_DESCRIPTION_LENGTH} caracteres.`);
    }
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

  if (raw.city !== undefined && raw.city !== null && typeof raw.city !== "string") {
    errors.push("Cidade deve ser um texto válido.");
  }

  if (raw.state !== undefined && raw.state !== null && typeof raw.state !== "string") {
    errors.push("Estado deve ser uma sigla válida.");
  }

  if (!isValidBetaLocation(raw.city as string | undefined, raw.state as string | undefined)) {
    errors.push("O Ipebook está em fase beta exclusivamente em Piripiri, PI.");
  }

  if (raw.photoUrl !== undefined && raw.photoUrl !== null) {
    if (typeof raw.photoUrl !== "string" || raw.photoUrl.trim().length === 0) {
      errors.push("URL da foto de capa deve ser um texto válido.");
    } else if (raw.photoUrl.length > MAX_PHOTO_URL_LENGTH) {
      errors.push(`URL da foto de capa deve conter no máximo ${MAX_PHOTO_URL_LENGTH} caracteres.`);
    } else if (!isValidHttpUrl(raw.photoUrl)) {
      errors.push("URL da foto de capa deve ser um endereço HTTP ou HTTPS válido.");
    }
  }

  if (raw.photos !== undefined && raw.photos !== null) {
    if (!Array.isArray(raw.photos)) {
      errors.push("Galeria de fotos deve ser uma lista.");
    } else {
      if (raw.photos.length > MAX_PHOTOS) {
        errors.push(`O anúncio pode conter no máximo ${MAX_PHOTOS} fotos.`);
      }
      for (const item of raw.photos) {
        if (typeof item !== "string" || item.trim().length === 0) {
          errors.push("Cada foto da galeria deve ser um texto com URL válida.");
          break;
        } else if (item.length > MAX_PHOTO_URL_LENGTH) {
          errors.push(`Cada URL de foto deve conter no máximo ${MAX_PHOTO_URL_LENGTH} caracteres.`);
          break;
        } else if (!isValidHttpUrl(item)) {
          errors.push("Cada foto da galeria deve ser um endereço HTTP ou HTTPS válido.");
          break;
        }
      }
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
