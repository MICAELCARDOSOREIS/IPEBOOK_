import {
  buildBookOpenGraph,
  buildOpenGraphHtmlTags,
  getIllustrativeCoverUrl,
  injectOpenGraphIntoHtml,
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_NAME,
} from "@/model/formatters/openGraphFormatter";

describe("openGraphFormatter (Spec 119, ADR 0093)", () => {
  it("monta metadados para anúncio de venda com foto e bairro", () => {
    const meta = buildBookOpenGraph({
      id: "livro-123",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      tradeType: "sell",
      price: 25,
      photoUrl: "https://imagens.exemplo.com/dom-casmurro.jpg",
      bairro: "Centro",
    });

    expect(meta.title).toBe("Dom Casmurro · Machado de Assis | IpêBook Piripiri");
    expect(meta.description).toContain("💰 Venda: R$ 25,00 no bairro Centro, Piripiri - PI.");
    expect(meta.image).toBe("https://imagens.exemplo.com/dom-casmurro.jpg");
    expect(meta.url).toBe("https://ipebook.app/livro/livro-123");
    expect(meta.type).toBe("book");
    expect(meta.siteName).toBe(DEFAULT_SITE_NAME);
  });

  it("monta metadados para anúncio de doação sem bairro e sem foto usando a capa ilustrativa do livro", () => {
    const meta = buildBookOpenGraph({
      id: "livro-456",
      title: "O Alquimista",
      author: "Paulo Coelho",
      tradeType: "donation",
      photoUrl: null,
    });

    expect(meta.title).toBe("O Alquimista · Paulo Coelho | IpêBook Piripiri");
    expect(meta.description).toContain("🎁 Doação gratuita em Piripiri - PI.");
    expect(meta.image).toBe(getIllustrativeCoverUrl("livro-456"));
    expect(meta.image).toMatch(/^https:\/\/ipebook\.app\/capas\/capa-[134]\.webp$/);
    expect(getIllustrativeCoverUrl("")).toBe(DEFAULT_OG_IMAGE);
    expect(meta.url).toBe("https://ipebook.app/livro/livro-456");
  });

  it("monta metadados para box de múltiplos volumes", () => {
    const meta = buildBookOpenGraph({
      id: "box-789",
      title: "Trilogia O Senhor dos Anéis",
      author: "J.R.R. Tolkien",
      tradeType: "trade",
      isBox: true,
      boxVolumesCount: 3,
      bairro: "Pacavira",
      photoUrl: "https://imagens.exemplo.com/lotr-box.jpg",
    });

    expect(meta.title).toBe("Box: Trilogia O Senhor dos Anéis (3 vols) · J.R.R. Tolkien | IpêBook Piripiri");
    expect(meta.description).toContain("🔄 Disponível para troca no bairro Pacavira, Piripiri - PI.");
    expect(meta.description).toContain("Coleção completa com 3 volumes.");
    expect(meta.image).toBe("https://imagens.exemplo.com/lotr-box.jpg");
  });

  it("gera tags HTML com escaping correto contra injeção", () => {
    const tags = buildOpenGraphHtmlTags({
      title: "Livro <Legal> & Bacana",
      description: 'Descrição com "aspas" & símbolos',
      image: "https://site.com/foto.jpg",
      url: "https://ipebook.app/livro/1",
      type: "book",
      siteName: "IpêBook Piripiri",
    });

    expect(tags).toContain('<meta property="og:title" content="Livro &lt;Legal&gt; &amp; Bacana" />');
    expect(tags).toContain('<meta property="og:description" content="Descrição com &quot;aspas&quot; &amp; símbolos" />');
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it("injeta metadados e substitui título em documento HTML existente", () => {
    const htmlInicial = `<!DOCTYPE html><html><head><title>Título Antigo</title></head><body><h1>Conteúdo</h1></body></html>`;
    const meta = buildBookOpenGraph({
      id: "abc",
      title: "Capitães da Areia",
      author: "Jorge Amado",
      tradeType: "sell",
      price: 18.5,
    });

    const htmlResultado = injectOpenGraphIntoHtml(htmlInicial, meta);

    expect(htmlResultado).toContain("<title>Capitães da Areia · Jorge Amado | IpêBook Piripiri</title>");
    expect(htmlResultado).not.toContain("Título Antigo");
    expect(htmlResultado).toContain('<meta property="og:title" content="Capitães da Areia · Jorge Amado | IpêBook Piripiri" />');
    expect(htmlResultado).toContain('<meta property="og:url" content="https://ipebook.app/livro/abc" />');
    expect(htmlResultado).toContain("</head>");
  });

  it("exige https:// em photoUrl e recorre à capa ilustrativa para http:// ou outros esquemas (Spec 143 / M5)", () => {
    const httpMeta = buildBookOpenGraph({
      id: "livro-http",
      title: "Vidas Secas",
      author: "Graciliano Ramos",
      tradeType: "donation",
      photoUrl: "http://inseguro.example/capa.jpg",
    });
    expect(httpMeta.image).toBe(getIllustrativeCoverUrl("livro-http"));

    const protoMeta = buildBookOpenGraph({
      id: "livro-proto",
      title: "Vidas Secas",
      author: "Graciliano Ramos",
      tradeType: "donation",
      photoUrl: "https:invalido",
    });
    expect(protoMeta.image).toBe(getIllustrativeCoverUrl("livro-proto"));
  });

  it("neutraliza padrões especiais de String.prototype.replace ($&, $`, $') em injectOpenGraphIntoHtml (Spec 143 / M5)", () => {
    const meta = buildBookOpenGraph({
      id: "livro-dollar",
      title: "Preço $& e $` e $'",
      author: "Autor $&",
      tradeType: "sell",
      price: 10,
    });
    const comTitle = "<!DOCTYPE html><html><head><title>Antigo</title></head><body>Corpo</body></html>";
    const resComTitle = injectOpenGraphIntoHtml(comTitle, meta);
    expect(resComTitle).toContain("<title>Preço $&amp; e $` e $&#39; · Autor $&amp; | IpêBook Piripiri</title>");
    expect(resComTitle).not.toContain("<title>Antigo</title>");
    expect(resComTitle.match(/<!DOCTYPE html>/g)).toHaveLength(1);
    expect(resComTitle.match(/<\/head>/g)).toHaveLength(1);

    const semTitle = "<!DOCTYPE html><html><head></head><body>Corpo</body></html>";
    const resSemTitle = injectOpenGraphIntoHtml(semTitle, meta);
    expect(resSemTitle).toContain("<title>Preço $&amp; e $` e $&#39; · Autor $&amp; | IpêBook Piripiri</title>");
    expect(resSemTitle.match(/<head>/g)).toHaveLength(1);
    expect(resSemTitle.match(/<\/head>/g)).toHaveLength(1);
  });
});
