import { pageTitleFor } from "@/view/pageTitle";

describe("pageTitleFor", () => {
  it("nomeia a aba pela rota", () => {
    expect(pageTitleFor("/meus-pedidos")).toBe("Conversas · IpêBook");
    expect(pageTitleFor("/conversas")).toBe("Conversas · IpêBook");
    expect(pageTitleFor("/perfil/configuracoes")).toBe("Configurações · IpêBook");
    expect(pageTitleFor("/moderacao")).toBe("Moderação · IpêBook");
    expect(pageTitleFor("/")).toBe("Início · IpêBook");
  });

  it("dá títulos descritivos a páginas dinâmicas, autenticação e endereços desconhecidos", () => {
    const titles = {
      "/alertas/exemplo": "Gerenciar alerta",
      "/alertas/exemplo/editar": "Editar alerta",
      "/auth/callback": "Concluir autenticação",
      "/conversa/exemplo": "Conversa",
      "/denunciar-pessoa/exemplo": "Denunciar pessoa",
      "/denunciar/exemplo": "Denunciar anúncio",
      "/editar-anuncio/exemplo": "Editar anúncio",
      "/gerenciar-anuncio/exemplo": "Gerenciar anúncio",
      "/livro/exemplo": "Detalhes do livro",
      "/negociacao/exemplo": "Negociação",
      "/negociacao/exemplo/encontro": "Combinar encontro",
      "/negociacao/exemplo/entrega": "Entrega do livro",
      "/perfil/exemplo": "Perfil de membro",
      "/endereco-inexistente": "Página não encontrada",
    };
    for (const [path, title] of Object.entries(titles)) {
      expect(pageTitleFor(path)).toBe(`${title} · IpêBook`);
    }
  });
});
