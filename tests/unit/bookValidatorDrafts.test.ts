import { validateDraftPayload } from "@/model/validators/bookValidator";

// Spec 017 — validação tolerante de rascunho: incompleto por natureza, mas ainda
// exige formato válido nos campos que, se presentes, violariam os CHECKs do banco.

describe("validateDraftPayload (Spec 017)", () => {
  it("aprova rascunho totalmente vazio, apenas com dono e modalidade", () => {
    const result = validateDraftPayload({ ownerId: "owner-1", modality: "donation", title: "", author: "" });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("não exige título, autor nem preço (diferença do payload completo)", () => {
    expect(validateDraftPayload({ ownerId: "o", modality: "sale" }).isValid).toBe(true);
  });

  it("recusa quando não há dono", () => {
    const result = validateDraftPayload({ ownerId: "", modality: "trade" });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Identificador do dono é obrigatório.");
  });

  it("recusa modalidade inválida", () => {
    const result = validateDraftPayload({ ownerId: "o", modality: "errada" });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("Modalidade"))).toBe(true);
  });

  it("recusa conservação fora da lista quando informada", () => {
    const result = validateDraftPayload({ ownerId: "o", modality: "donation", condition: "antiga" });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("conservação"))).toBe(true);
  });

  it("recusa URL de foto inválida ou http:// quando presente (Spec 143 / M7)", () => {
    const ftp = validateDraftPayload({ ownerId: "o", modality: "donation", photoUrl: "ftp://x" });
    expect(ftp.isValid).toBe(false);
    expect(ftp.errors.some((e) => e.includes("HTTPS"))).toBe(true);

    const httpCover = validateDraftPayload({ ownerId: "o", modality: "donation", photoUrl: "http://exemplo.com/a.jpg" });
    expect(httpCover.isValid).toBe(false);
    expect(httpCover.errors.some((e) => e.includes("HTTPS"))).toBe(true);

    const httpGallery = validateDraftPayload({
      ownerId: "o",
      modality: "donation",
      photos: ["https://exemplo.com/a.jpg", "http://exemplo.com/b.jpg"],
    });
    expect(httpGallery.isValid).toBe(false);
    expect(httpGallery.errors.some((e) => e.includes("HTTPS"))).toBe(true);
  });

  it("aceita URLs https válidas na galeria", () => {
    const result = validateDraftPayload({
      ownerId: "o",
      modality: "donation",
      photos: ["https://exemplo.com/a.jpg", "https://exemplo.com/b.jpg"],
    });
    expect(result.isValid).toBe(true);
  });

  it("recusa entrada que não é objeto", () => {
    expect(validateDraftPayload(null).isValid).toBe(false);
  });
});
