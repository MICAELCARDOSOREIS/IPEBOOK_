import type { BookModality } from "@/model/entities/book";

export type ListingBasicsErrors = Partial<Record<"title" | "author" | "price", string>>;

/** Valida a etapa 1 antes de avançar, para o erro aparecer junto do campo e não só ao publicar. */
export function validateListingBasics(input: {
  title: string;
  author: string;
  modality: BookModality;
  price: string;
}): ListingBasicsErrors {
  const errors: ListingBasicsErrors = {};
  if (!input.title.trim()) errors.title = "Informe o título do livro.";
  if (!input.author.trim()) errors.author = "Informe o autor do livro.";
  if (input.modality === "sale") {
    const value = Number(input.price.trim().replace(",", "."));
    if (!input.price.trim() || !Number.isFinite(value) || value <= 0) {
      errors.price = "Informe um preço maior que zero.";
    }
  }
  return errors;
}
