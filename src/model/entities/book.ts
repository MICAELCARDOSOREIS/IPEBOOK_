export type BookModality = "sale" | "trade" | "donation";
export type BookStatus = "available" | "reserved" | "paused" | "draft" | "delivered";

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

/** Limites dos dados da edição vindos do ISBN (Spec 097); a sinopse é do livro, não escrita pela pessoa. */
export const MAX_BOOK_SYNOPSIS_LENGTH = 2000;
export const MAX_BOOK_PUBLISHER_LENGTH = 120;

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
  /** Sinopse e dados da edição, preenchidos pelo ISBN (Spec 097). */
  synopsis?: string;
  publisher?: string;
  pageCount?: number;
  publicationYear?: number;
  city?: string;
  state?: string;
  neighborhood?: string;
  photoUrl?: string;
  photos?: readonly string[];
  /**
   * Etapa do assistente de publicação em que o rascunho foi salvo (1 Livro, 2 Fotos,
   * 3 Detalhes). Presente apenas em anúncios com status `"draft"` (Spec 017), usada
   * para retomar o fluxo exatamente de onde a pessoa parou.
   */
  draftStep?: number;
}>;
