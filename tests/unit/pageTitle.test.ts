import { describe, expect, it } from "vitest";
import { pageTitleFor } from "@/view/pageTitle";

describe("pageTitleFor", () => {
  it("nomeia a aba pela rota", () => {
    expect(pageTitleFor("/meus-pedidos")).toBe("Conversas · IpêBook");
    expect(pageTitleFor("/conversas")).toBe("Conversas · IpêBook");
    expect(pageTitleFor("/perfil/configuracoes")).toBe("Configurações · IpêBook");
    expect(pageTitleFor("/moderacao")).toBe("Moderação · IpêBook");
    expect(pageTitleFor("/")).toBe("Início · IpêBook");
  });

  it("usa só o nome do app em rotas dinâmicas ou desconhecidas", () => {
    expect(pageTitleFor("/livro/abc")).toBe("IpêBook");
  });
});
