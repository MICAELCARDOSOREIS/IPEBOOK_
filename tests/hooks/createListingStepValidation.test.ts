import { describe, expect, it } from "vitest";
import { validateListingBasics } from "@/viewmodel/listingBasicsValidation";

describe("validateListingBasics (etapa 1 do anúncio)", () => {
  const base = { title: "Dom Casmurro", author: "Machado de Assis", modality: "trade" as const, price: "" };

  it("aceita troca sem preço", () => {
    expect(validateListingBasics(base)).toEqual({});
  });

  it("exige título e autor preenchidos", () => {
    expect(validateListingBasics({ ...base, title: "  ", author: "" })).toEqual({
      title: "Informe o título do livro.",
      author: "Informe o autor do livro.",
    });
  });

  it("exige preço maior que zero na venda, aceitando vírgula", () => {
    expect(validateListingBasics({ ...base, modality: "sale", price: "" }).price).toBeDefined();
    expect(validateListingBasics({ ...base, modality: "sale", price: "0" }).price).toBeDefined();
    expect(validateListingBasics({ ...base, modality: "sale", price: "abc" }).price).toBeDefined();
    expect(validateListingBasics({ ...base, modality: "sale", price: "25,50" })).toEqual({});
  });
});
