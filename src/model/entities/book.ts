export type BookModality = "sale" | "trade" | "donation";
export type BookStatus = "available" | "reserved" | "paused";

/** Estado de conservação do exemplar (Figma `04.05 · Detalhes do livro`). */
export type BookCondition = "new" | "good" | "marked" | "worn";

export const BOOK_CONDITIONS: readonly BookCondition[] = ["new", "good", "marked", "worn"];

export const BOOK_CONDITION_LABELS: Readonly<Record<BookCondition, string>> = {
  new: "Novo",
  good: "Bom estado",
  marked: "Com marcas",
  worn: "Desgastado",
};

/** Limite da descrição, igual ao contador mostrado na etapa de detalhes do Figma. */
export const MAX_BOOK_DESCRIPTION_LENGTH = 280;

export type Book = Readonly<{
  id: string;
  title: string;
  author: string;
  category?: string;
  ownerId: string;
  modality: BookModality;
  price?: number;
  status: BookStatus;
  condition?: BookCondition;
  description?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  photoUrl?: string;
  photos?: readonly string[];
}>;
