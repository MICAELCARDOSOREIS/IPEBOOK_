import { describe, expect, it } from "vitest";
import { ShareUseCases } from "@/usecase/shareUseCases";
import { ValidationError } from "@/model/errors";

describe("ShareUseCases (Spec 019)", () => {
  const useCases = new ShareUseCases();

  it("monta o caminho de compartilhamento do anúncio", () => {
    expect(useCases.buildListingSharePath("b1")).toBe("/livro/b1");
  });

  it("remove espaços nas bordas do identificador", () => {
    expect(useCases.buildListingSharePath("  b1  ")).toBe("/livro/b1");
  });

  it("rejeita identificador vazio", () => {
    expect(() => useCases.buildListingSharePath("")).toThrow(ValidationError);
    expect(() => useCases.buildListingSharePath("   ")).toThrow(ValidationError);
  });

  it("monta mensagem formatada para troca, sem preço (Issue #145)", () => {
    const message = useCases.buildShareMessage(
      { title: "Dom Casmurro", author: "Machado de Assis", modality: "trade" },
      "https://ipebook.app/livro/b1",
    );
    expect(message).toBe(
      '"Dom Casmurro" de Machado de Assis — Troca.\nConfira no IpêBook: https://ipebook.app/livro/b1',
    );
  });

  it("monta mensagem formatada para venda, com preço (Issue #145)", () => {
    const message = useCases.buildShareMessage(
      { title: "O Cortiço", author: "Aluísio Azevedo", modality: "sale", price: 25 },
      "https://ipebook.app/livro/b2",
    );
    expect(message).toBe(
      '"O Cortiço" de Aluísio Azevedo — Venda por R$ 25.00.\nConfira no IpêBook: https://ipebook.app/livro/b2',
    );
  });

  it("monta mensagem formatada para doação", () => {
    const message = useCases.buildShareMessage(
      { title: "A Hora da Estrela", author: "Clarice Lispector", modality: "donation" },
      "https://ipebook.app/livro/b3",
    );
    expect(message).toContain("— Doação.");
  });

  it("monta a URL de compartilhamento do WhatsApp com o texto codificado", () => {
    const url = useCases.buildWhatsAppShareUrl('"Dom Casmurro" de Machado de Assis');
    expect(url).toBe(
      `whatsapp://send?text=${encodeURIComponent('"Dom Casmurro" de Machado de Assis')}`,
    );
  });
});
