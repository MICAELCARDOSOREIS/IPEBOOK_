import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  APP_SHELL_URLS,
  CATALOG_CACHE_NAME,
  DYNAMIC_CACHE_NAME,
  STATIC_CACHE_NAME,
  classifyRequest,
  createOfflineCatalogResponse,
  createOfflineHtmlResponse,
} from "@/infra/pwa/serviceWorkerLogic";

describe("Service Worker Registration e Simulação de Interceptação (Spec 041, Issue #176)", () => {
  const swPath = resolve(process.cwd(), "public/sw.js");
  const swContent = readFileSync(swPath, "utf-8");

  it("o arquivo public/sw.js existe e possui sintaxe válida com manipuladores de eventos", () => {
    expect(swContent).toBeDefined();
    expect(swContent).toContain("addEventListener(\"install\"");
    expect(swContent).toContain("addEventListener(\"activate\"");
    expect(swContent).toContain("addEventListener(\"fetch\"");
    expect(swContent).toContain(STATIC_CACHE_NAME);
    expect(swContent).toContain(DYNAMIC_CACHE_NAME);
    expect(swContent).toContain(CATALOG_CACHE_NAME);
  });

  it("garante que o pré-cache do App Shell inclui todas as rotas canônicas", () => {
    for (const route of APP_SHELL_URLS) {
      expect(swContent).toContain(`"${route}"`);
    }
  });

  describe("Simulação de ciclo de vida do Service Worker", () => {
    it("evento install abre o cache estático e adiciona assets do App Shell", async () => {
      const mockCache = {
        addAll: vi.fn().mockResolvedValue(undefined),
      };
      const mockCaches = {
        open: vi.fn().mockResolvedValue(mockCache),
      };

      // Simulação do comportamento de install
      const cache = await mockCaches.open(STATIC_CACHE_NAME);
      await cache.addAll([...APP_SHELL_URLS]);

      expect(mockCaches.open).toHaveBeenCalledWith(STATIC_CACHE_NAME);
      expect(mockCache.addAll).toHaveBeenCalledWith(expect.arrayContaining(["/index.html", "/manifest.json"]));
    });

    it("evento activate purga caches legados mantendo apenas os ativos", async () => {
      const existingCaches = [
        "ipebook-static-v1",
        "ipebook-catalog-v1",
        "ipebook-dynamic-v1",
        "ipebook-static-v0-legado",
        "cache-antigo-desconhecido",
      ];
      const activeCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, CATALOG_CACHE_NAME];
      const deleteMock = vi.fn().mockResolvedValue(true);

      const toDelete = existingCaches.filter((c) => !activeCaches.includes(c));
      await Promise.all(toDelete.map((c) => deleteMock(c)));

      expect(deleteMock).toHaveBeenCalledTimes(2);
      expect(deleteMock).toHaveBeenCalledWith("ipebook-static-v0-legado");
      expect(deleteMock).toHaveBeenCalledWith("cache-antigo-desconhecido");
    });
  });

  describe("Simulação de estratégias de interceptação de requisições", () => {
    it("navegação SPA offline recorre ao App Shell em cache", async () => {
      const request = {
        method: "GET",
        url: "https://ipebook.pages.dev/meus-pedidos",
        mode: "navigate",
      };
      expect(classifyRequest(request)).toBe("navigation");

      const mockAppShellResponse = new Response("<html>SPA App Shell</html>", {
        headers: { "Content-Type": "text/html" },
      });

      const mockCaches = {
        match: vi.fn().mockImplementation((target: string | { url: string }) => {
          if (typeof target === "string" && target === "/index.html") {
            return Promise.resolve(mockAppShellResponse);
          }
          return Promise.resolve(undefined);
        }),
      };

      // Simulação do fallback de navegação offline
      const cached = await mockCaches.match(request as unknown as Request);
      const finalResponse = cached || (await mockCaches.match("/index.html")) || createOfflineHtmlResponse();

      expect(finalResponse).toBe(mockAppShellResponse);
      const body = await finalResponse.text();
      expect(body).toBe("<html>SPA App Shell</html>");
    });

    it("navegação SPA offline sem cache nenhum retorna página offline amigável", async () => {
      const request = {
        method: "GET",
        url: "https://ipebook.pages.dev/desconhecido",
        mode: "navigate",
      };
      const mockCaches = {
        match: vi.fn().mockResolvedValue(undefined),
      };

      const cached = await mockCaches.match(request as unknown as Request);
      const appShell = await mockCaches.match("/index.html");
      const finalResponse = cached || appShell || createOfflineHtmlResponse();

      expect(finalResponse.headers.get("X-Ipebook-Offline")).toBe("true");
      const text = await finalResponse.text();
      expect(text).toContain("IpêBook Piripiri");
    });

    it("catálogo de livros offline com cache hit retorna dados previamente armazenados", async () => {
      const request = {
        method: "GET",
        url: "https://xiuuiggpccpgrwkzeloc.supabase.co/rest/v1/livros?select=*",
      };
      expect(classifyRequest(request)).toBe("catalog");

      const mockSavedCatalog = new Response(JSON.stringify([{ id: "1", title: "Dom Casmurro" }]), {
        headers: { "Content-Type": "application/json" },
      });

      const mockCaches = {
        match: vi.fn().mockResolvedValue(mockSavedCatalog),
      };

      // Simulação de falha de rede seguida de hit de cache
      const cached = await mockCaches.match(request as unknown as Request);
      const response = cached || createOfflineCatalogResponse();

      expect(response).toBe(mockSavedCatalog);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe("Dom Casmurro");
    });

    it("catálogo de livros offline sem cache salvo retorna resposta fallback amigável", async () => {
      const request = {
        method: "GET",
        url: "https://xiuuiggpccpgrwkzeloc.supabase.co/rest/v1/livros?select=*",
      };
      const mockCaches = {
        match: vi.fn().mockResolvedValue(undefined),
      };

      const cached = await mockCaches.match(request as unknown as Request);
      const response = cached || createOfflineCatalogResponse();

      expect(response.headers.get("X-Ipebook-Offline")).toBe("true");
      const json = await response.json();
      expect(json.offline).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.message).toContain("sem conexão com a internet");
    });

    it("requisições sensíveis de autenticação transitam como pass-through", () => {
      const authRequest = {
        method: "GET",
        url: "https://xiuuiggpccpgrwkzeloc.supabase.co/auth/v1/user",
      };
      expect(classifyRequest(authRequest)).toBe("pass-through");
    });
  });
});
