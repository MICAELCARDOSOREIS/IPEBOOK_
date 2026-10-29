/**
 * Lógica modular e determinística do Service Worker do IpêBook (Spec 041, ADR 0035).
 * Exporta constantes, funções puras de classificação e estratégias de cache para reutilização e testes.
 */

export const STATIC_CACHE_NAME = "ipebook-static-v1";
export const DYNAMIC_CACHE_NAME = "ipebook-dynamic-v1";
export const CATALOG_CACHE_NAME = "ipebook-catalog-v1";

export const APP_SHELL_URLS: readonly string[] = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icone-192.png",
  "/icone-512.png",
  "/favicon.ico",
  "/bem-vindo.html",
  "/pesquisa.html",
  "/termos.html",
  "/ajuda.html",
];

export type RequestCategory = "navigation" | "catalog" | "static-asset" | "pass-through";

/**
 * Determina se a requisição é de navegação HTML (SPA App Shell).
 */
export function isNavigationRequest(mode?: string, acceptHeader?: string | null): boolean {
  if (mode === "navigate") return true;
  if (acceptHeader && acceptHeader.includes("text/html")) return true;
  return false;
}

/**
 * Determina se a URL corresponde a um asset estático (scripts JS, estilos, imagens, fontes).
 */
export function isStaticAsset(url: URL): boolean {
  const pathname = url.pathname;
  if (pathname.startsWith("/_expo/static/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") return true;
  return /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i.test(pathname);
}

/**
 * Determina se a URL corresponde a uma consulta de catálogo de livros no backend Supabase.
 */
export function isCatalogRequest(url: URL): boolean {
  return url.pathname.includes("/rest/v1/livros");
}

/**
 * Classifica a requisição para determinar a estratégia de cache apropriada.
 */
export function classifyRequest(request: {
  method: string;
  url: string;
  mode?: string;
  headers?: { get(name: string): string | null };
}): RequestCategory {
  if (request.method !== "GET") return "pass-through";

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(request.url, "https://ipebook.local");
  } catch {
    return "pass-through";
  }

  // Ignorar protocolos que não sejam http/https (ex: chrome-extension, data, blob)
  if (!parsedUrl.protocol.startsWith("http")) return "pass-through";

  // Rotas sensíveis de autenticação transitam diretamente pela rede sem cache
  if (parsedUrl.pathname.includes("/auth/v1/")) return "pass-through";

  const acceptHeader = request.headers?.get("accept");
  if (isNavigationRequest(request.mode, acceptHeader)) {
    return "navigation";
  }

  if (isCatalogRequest(parsedUrl)) {
    return "catalog";
  }

  if (isStaticAsset(parsedUrl)) {
    return "static-asset";
  }

  return "pass-through";
}

/**
 * Gera resposta HTML amigável quando o usuário está offline e o App Shell não pôde ser recuperado do cache.
 */
export function createOfflineHtmlResponse(): Response {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IpêBook — Modo Offline</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #F6F1E8;
        color: #1F2937;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
        box-sizing: border-box;
      }
      .card {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 32px 24px;
        max-width: 420px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }
      h1 { color: #2C5E45; font-size: 22px; margin-bottom: 12px; }
      p { font-size: 15px; line-height: 1.5; color: #4B5563; margin-bottom: 24px; }
      button {
        background: #2C5E45;
        color: #FFFFFF;
        border: none;
        padding: 12px 24px;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>IpêBook Piripiri</h1>
      <p>Você está desconectado da internet. Seus dados e livros salvos serão recarregados assim que a conexão for reestabelecida.</p>
      <button onclick="window.location.reload()">Tentar novamente</button>
    </div>
  </body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Ipebook-Offline": "true",
    },
  });
}

/**
 * Gera resposta JSON amigável quando uma consulta de catálogo falha offline sem cópia em cache.
 */
export function createOfflineCatalogResponse(): Response {
  const payload = JSON.stringify({
    data: [],
    offline: true,
    message: "Você está sem conexão com a internet e não há dados em cache para esta consulta de livros.",
  });
  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Ipebook-Offline": "true",
    },
  });
}
