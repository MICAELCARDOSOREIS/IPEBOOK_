import { categoryTone } from "@/view/categoryTone";
import { SUPPORT_EMAIL, supportMailtoUrl } from "@/view/supportContact";

describe("categoryTone (Spec 091)", () => {
  it("dá sempre a mesma cor à mesma categoria, sem diferenciar caixa ou espaços", () => {
    expect(categoryTone(" Ficção ")).toEqual(categoryTone("ficção"));
  });

  it("retorna códigos hexadecimais válidos para fundo e texto", () => {
    const tone = categoryTone("Literatura Brasileira");
    expect(tone.background).toMatch(/^#/);
    expect(tone.text).toMatch(/^#/);
  });
});

describe("supportMailtoUrl (Spec 092)", () => {
  it("usa a versão informada ou 'desconhecida'", () => {
    expect(decodeURIComponent(supportMailtoUrl("1.2.3"))).toContain("Versão do aplicativo: 1.2.3");
    expect(decodeURIComponent(supportMailtoUrl(null))).toContain("desconhecida");
    expect(supportMailtoUrl(null).startsWith(`mailto:${SUPPORT_EMAIL}?subject=`)).toBe(true);
  });
});
