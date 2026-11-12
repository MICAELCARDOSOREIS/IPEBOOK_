import { MAX_BOOK_PUBLISHER_LENGTH, MAX_BOOK_SYNOPSIS_LENGTH, type Book } from "@/model/entities/book";
import { sanitizeTextInput } from "@/model/validators/textSanitizer";

export type BookEdition = Pick<Book, "synopsis" | "publisher" | "pageCount" | "publicationYear">;

/** Corta no fim da última palavra que cabe e acrescenta reticências; não corta no meio de uma palavra. */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

const integerInRange = (value: unknown, min: number, max: number): number | undefined => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

/**
 * Limpa os dados da edição vindos do ISBN (Spec 097): sinopse e editora sem HTML nem controle e com limite de
 * tamanho; páginas e ano só se forem números inteiros plausíveis. Campo vazio ou inválido é omitido.
 */
export function normalizeEdition(input: Partial<BookEdition> | undefined | null): BookEdition {
  const synopsis = input?.synopsis ? truncateAtWord(sanitizeTextInput(input.synopsis), MAX_BOOK_SYNOPSIS_LENGTH) : "";
  const publisher = input?.publisher ? sanitizeTextInput(input.publisher).slice(0, MAX_BOOK_PUBLISHER_LENGTH).trim() : "";
  const pageCount = integerInRange(input?.pageCount, 1, 20000);
  const publicationYear = integerInRange(input?.publicationYear, 1000, 2100);
  return {
    ...(synopsis ? { synopsis } : {}),
    ...(publisher ? { publisher } : {}),
    ...(pageCount ? { pageCount } : {}),
    ...(publicationYear ? { publicationYear } : {}),
  };
}
