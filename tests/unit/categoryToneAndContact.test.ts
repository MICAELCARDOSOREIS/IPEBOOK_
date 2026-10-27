import { describe, expect, it } from "vitest";
import { categoryTone } from "@/view/categoryTone";
import { SUPPORT_EMAIL, supportMailtoUrl } from "@/view/supportContact";

describe("categoryTone (Spec 091)", () => {
  it("dá sempre a mesma cor à mesma categoria, sem diferenciar caixa ou espaços", () => {
    expect(categoryTone(" Ficção ", "light")).toEqual(categoryTone("ficção", "light"));
  });

  it("tem paleta própria no tema escuro", () => {
    const light = categoryTone("Literatura Brasileira", "light");
    const dark = categoryTone("Literatura Brasileira", "dark");
    expect(dark).not.toEqual(light);
    expect(dark.background).toMatch(/^#/);
  });
});

describe("supportMailtoUrl (Spec 092)", () => {
  it("usa a versão informada ou 'desconhecida'", () => {
    expect(decodeURIComponent(supportMailtoUrl("1.2.3"))).toContain("Versão do aplicativo: 1.2.3");
    expect(decodeURIComponent(supportMailtoUrl(null))).toContain("desconhecida");
    expect(supportMailtoUrl(null).startsWith(`mailto:${SUPPORT_EMAIL}?subject=`)).toBe(true);
  });
});
