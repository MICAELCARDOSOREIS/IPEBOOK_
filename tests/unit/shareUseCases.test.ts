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
});
