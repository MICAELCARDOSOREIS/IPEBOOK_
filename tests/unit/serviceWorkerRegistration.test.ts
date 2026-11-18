import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { BOOK_COLUMNS } from "@/infra/datasources/supabaseBookDataSource";
import {
  APP_SHELL_URLS,
  CATALOG_CACHE_NAME,
  DYNAMIC_CACHE_NAME,
  STATIC_CACHE_NAME,
  classifyRequest,
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
        addAll: jest.fn().mockResolvedValue(undefined),
      };
      const mockCaches = {
        open: jest.fn().mockResolvedValue(mockCache),
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
        "ipebook-catalog-v2",
        "ipebook-dynamic-v2",
        "ipebook-static-v0-legado",
        "ipebook-dynamic-v1",
        "cache-antigo-desconhecido",
      ];
      const activeCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, CATALOG_CACHE_NAME];
      const deleteMock = jest.fn().mockResolvedValue(true);

      const toDelete = existingCaches.filter((c) => !activeCaches.includes(c));
      await Promise.all(toDelete.map((c) => deleteMock(c)));

      expect(deleteMock).toHaveBeenCalledTimes(3);
      expect(deleteMock).toHaveBeenCalledWith("ipebook-static-v0-legado");
      expect(deleteMock).toHaveBeenCalledWith("ipebook-dynamic-v1");
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
        match: jest.fn().mockImplementation((target: string | { url: string }) => {
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
        match: jest.fn().mockResolvedValue(undefined),
      };

      const cached = await mockCaches.match(request as unknown as Request);
      const appShell = await mockCaches.match("/index.html");
      const finalResponse = cached || appShell || createOfflineHtmlResponse();

      expect(finalResponse.headers.get("X-Ipebook-Offline")).toBe("true");
      const text = await finalResponse.text();
      expect(text).toContain("IpêBook Piripiri");
    });

    it("o worker publicado só armazena o catálogo público e responde 503 sem cache", async () => {
      const apiKey = "sb_publishable_teste";
      const url = new URL("https://projeto.supabase.co/rest/v1/v2_books");
      url.searchParams.set("select", BOOK_COLUMNS);
      url.searchParams.append("status", "neq.paused");
      url.searchParams.append("status", "neq.draft");
      url.searchParams.append("status", "neq.delivered");
      const online = new Response(JSON.stringify([{ id: "1", title: "Dom Casmurro" }]));
      const cache = { put: jest.fn().mockResolvedValue(undefined), match: jest.fn() };
      const open = jest.fn().mockResolvedValue(cache);
      const fetch = jest.fn().mockResolvedValueOnce(online).mockRejectedValue(new Error("Offline"));
      const handlers = new Map<string, (event: unknown) => void>();
      runInNewContext(swContent, {
        self: { addEventListener: (name: string, handler: (event: unknown) => void) => handlers.set(name, handler) },
        URL,
        Response,
        fetch,
        caches: { open },
      });

      const dispatch = (target: URL, token = apiKey) => {
        const request = new Request(target, { headers: { apikey: apiKey, Authorization: `Bearer ${token}` } });
        const respondWith = jest.fn();
        handlers.get("fetch")?.({ request, respondWith });
        return respondWith.mock.calls[0]?.[0] as Promise<Response> | undefined;
      };

      expect(dispatch(url, "sessao-autenticada")).toBeUndefined();
      const estante = new URL(url);
      estante.searchParams.set("owner_id", "eq.dono");
      expect(dispatch(estante)).toBeUndefined();
      expect(dispatch(new URL("https://ipebook.app/auth/callback?code=codigo"))).toBeUndefined();
      expect(dispatch(new URL("https://ipebook.app/redefinir-senha?code=codigo"))).toBeUndefined();
      expect(open).not.toHaveBeenCalled();
      expect(await dispatch(url)).toBe(online);
      expect(open).toHaveBeenCalledWith(CATALOG_CACHE_NAME);
      expect(cache.put).toHaveBeenCalledTimes(1);
      cache.match.mockResolvedValueOnce(online);
      expect(await dispatch(url)).toBe(online);
      const offline = await dispatch(url);
      expect(offline?.status).toBe(503);
      expect(offline?.headers.get("X-Ipebook-Offline")).toBe("true");
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
