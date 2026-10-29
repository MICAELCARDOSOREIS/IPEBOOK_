import { describe, expect, it } from "vitest";
import { webBetaRedirect } from "@/view/webBetaMode";

describe("webBetaRedirect (Spec 108, site só com o convite do beta)", () => {
  it("manda as telas do app (incluindo login do app) para a página inicial", () => {
    for (const path of ["/", "/pesquisa", "/anunciar", "/perfil", "/criar-conta", "/entrar", "/esqueci-senha", "/redefinir-senha", "/livro/abc"]) {
      expect(webBetaRedirect(path, true)).toBe("/bem-vindo");
    }
  });

  it("mantém o convite, as páginas institucionais e a exclusão de conta", () => {
    for (const path of ["/bem-vindo", "/sobre", "/beta", "/ajuda", "/termos", "/excluir-conta", "/auth/callback"]) {
      expect(webBetaRedirect(path, true)).toBeNull();
    }
  });

  it("não redireciona nada quando o modo está desligado (app nativo)", () => {
    expect(webBetaRedirect("/", false)).toBeNull();
    expect(webBetaRedirect("/anunciar", false)).toBeNull();
  });
});
