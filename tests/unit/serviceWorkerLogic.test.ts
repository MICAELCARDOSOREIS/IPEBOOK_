import { describe, expect, it } from "vitest";
import {
  APP_SHELL_URLS,
  CATALOG_CACHE_NAME,
  DYNAMIC_CACHE_NAME,
  STATIC_CACHE_NAME,
  classifyRequest,
  createOfflineCatalogResponse,
  createOfflineHtmlResponse,
  isCatalogRequest,
  isNavigationRequest,
  isStaticAsset,
} from "@/infra/pwa/serviceWorkerLogic";

describe("serviceWorkerLogic (Spec 041, ADR 0035)", () => {
  it("expõe nomes corretos para caches ativos e lista canônica do App Shell", () => {
    expect(STATIC_CACHE_NAME).toBe("ipebook-static-v1");
    expect(DYNAMIC_CACHE_NAME).toBe("ipebook-dynamic-v1");
    expect(CATALOG_CACHE_NAME).toBe("ipebook-catalog-v1");
    expect(APP_SHELL_URLS).toContain("/");
    expect(APP_SHELL_URLS).toContain("/index.html");
    expect(APP_SHELL_URLS).toContain("/manifest.json");
    expect(APP_SHELL_URLS).toContain("/icone-192.png");
    expect(APP_SHELL_URLS).toContain("/icone-512.png");
  });

  describe("isNavigationRequest", () => {
    it("identifica requisições com mode 'navigate'", () => {
      expect(isNavigationRequest("navigate", undefined)).toBe(true);
      expect(isNavigationRequest("navigate", "text/html")).toBe(true);
    });

    it("identifica requisições com cabeçalho Accept contendo text/html", () => {
      expect(isNavigationRequest("cors", "text/html,application/xhtml+xml")).toBe(true);
    });

    it("retorna false para requisições de API ou assets sem text/html", () => {
      expect(isNavigationRequest("cors", "application/json")).toBe(false);
      expect(isNavigationRequest("no-cors", "image/*")).toBe(false);
      expect(isNavigationRequest(undefined, null)).toBe(false);
    });
  });

  describe("isStaticAsset", () => {
    it("identifica assets em pastas estáticas do Expo e assets locais", () => {
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/_expo/static/js/bundle.js"))).toBe(true);
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/assets/logo.png"))).toBe(true);
    });

    it("identifica fontes externas autorizadas do Google", () => {
      expect(isStaticAsset(new URL("https://fonts.googleapis.com/css2?family=Roboto"))).toBe(true);
      expect(isStaticAsset(new URL("https://fonts.gstatic.com/s/sourceserif4/v8/font.woff2"))).toBe(true);
    });

    it("identifica arquivos por extensão de asset", () => {
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/bundle.css"))).toBe(true);
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/favicon.ico"))).toBe(true);
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/foto.webp"))).toBe(true);
    });

    it("retorna false para rotas dinâmicas ou endpoints de dados", () => {
      expect(isStaticAsset(new URL("https://ipebook.pages.dev/pesquisa"))).toBe(false);
      expect(isStaticAsset(new URL("https://supabase.co/rest/v1/livros"))).toBe(false);
    });
  });

  describe("isCatalogRequest", () => {
    it("identifica rotas do Supabase direcionadas à tabela de livros", () => {
      expect(isCatalogRequest(new URL("https://supabase.co/rest/v1/livros?select=*"))).toBe(true);
      expect(isCatalogRequest(new URL("https://supabase.co/rest/v1/livros_com_metricas"))).toBe(true);
    });

    it("retorna false para outras tabelas ou endpoints", () => {
      expect(isCatalogRequest(new URL("https://supabase.co/rest/v1/profiles"))).toBe(false);
      expect(isCatalogRequest(new URL("https://supabase.co/auth/v1/token"))).toBe(false);
    });
  });

  describe("classifyRequest", () => {
    it("ignora métodos diferentes de GET retornando pass-through", () => {
      const result = classifyRequest({
        method: "POST",
        url: "https://ipebook.pages.dev/anunciar",
      });
      expect(result).toBe("pass-through");
    });

    it("retorna pass-through para URL malformada", () => {
      const result = classifyRequest({
        method: "GET",
        url: "http://[invalid-url",
      });
      expect(result).toBe("pass-through");
    });

    it("retorna pass-through para protocolos não suportados", () => {
      const result = classifyRequest({
        method: "GET",
        url: "chrome-extension://abc/script.js",
      });
      expect(result).toBe("pass-through");
    });

    it("retorna pass-through para rotas de autenticação", () => {
      const result = classifyRequest({
        method: "GET",
        url: "https://supabase.co/auth/v1/user",
      });
      expect(result).toBe("pass-through");
    });

    it("classifica requisições de navegação SPA", () => {
      const result = classifyRequest({
        method: "GET",
        url: "https://ipebook.pages.dev/livro/123",
        mode: "navigate",
      });
      expect(result).toBe("navigation");
    });

    it("classifica requisições para o catálogo de livros", () => {
      const result = classifyRequest({
        method: "GET",
        url: "https://supabase.co/rest/v1/livros?status=eq.ativo",
      });
      expect(result).toBe("catalog");
    });

    it("classifica requisições para assets estáticos", () => {
      const result = classifyRequest({
        method: "GET",
        url: "https://ipebook.pages.dev/_expo/static/js/web/entry-123.js",
      });
      expect(result).toBe("static-asset");
    });

    it("retorna pass-through para requisições GET não mapeadas", () => {
      const result = classifyRequest({
        method: "GET",
        url: "https://supabase.co/rest/v1/configuracoes",
      });
      expect(result).toBe("pass-through");
    });
  });

  describe("respostas offline amigáveis", () => {
    it("createOfflineHtmlResponse gera documento HTML em português com cabeçalhos adequados", async () => {
      const response = createOfflineHtmlResponse();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
      expect(response.headers.get("X-Ipebook-Offline")).toBe("true");

      const text = await response.text();
      expect(text).toContain("IpêBook Piripiri");
      expect(text).toContain("desconectado da internet");
      expect(text).toContain("Tentar novamente");
    });

    it("createOfflineCatalogResponse gera JSON válido estruturado para catálogo", async () => {
      const response = createOfflineCatalogResponse();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json; charset=utf-8");
      expect(response.headers.get("X-Ipebook-Offline")).toBe("true");

      const json = await response.json();
      expect(json.offline).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(0);
      expect(json.message).toContain("sem conexão com a internet");
    });
  });
});
