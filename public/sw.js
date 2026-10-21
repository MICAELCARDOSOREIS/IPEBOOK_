/**
 * IpêBook — Service Worker PWA (Spec 041, ADR 0035).
 * Fornece App Shell offline, Stale-While-Revalidate para assets e Network-First para catálogo de livros.
 */

const STATIC_CACHE_NAME = "ipebook-static-v1";
const DYNAMIC_CACHE_NAME = "ipebook-dynamic-v1";
const CATALOG_CACHE_NAME = "ipebook-catalog-v1";

const APP_SHELL_URLS = [
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

const ACTIVE_CACHES = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, CATALOG_CACHE_NAME];

// Instalação: Pré-cache do App Shell e ativação imediata
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) =>
        cache.addAll(APP_SHELL_URLS).catch((err) => {
          // Log suave para não quebrar a instalação se alguma rota específica falhar no pré-cache
          console.warn("[IpêBook SW] Falha parcial no pré-cache:", err);
        })
      )
      .then(() => self.skipWaiting())
  );
});

// Ativação: Limpeza atômica de versões legadas de cache e controle imediato de clientes
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !ACTIVE_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Resposta HTML amigável para offline quando nem o App Shell estiver em cache
function createOfflineHtmlResponse() {
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

// Resposta JSON amigável para catálogo de livros quando desconectado
function createOfflineCatalogResponse() {
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

function isStaticAsset(url) {
  const pathname = url.pathname;
  if (pathname.startsWith("/_expo/static/")) return true;
  if (pathname.startsWith("/assets/")) return true;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") return true;
  return /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i.test(pathname);
}

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Interceptar apenas requisições GET
  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Ignorar protocolos não suportados (ex: chrome-extension, data, blob)
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Rotas de autenticação Supabase transitam sem cache para preservar segurança de credenciais
  if (url.pathname.includes("/auth/v1/")) {
    return;
  }

  const acceptHeader = request.headers ? request.headers.get("accept") : "";
  const isNavigate = request.mode === "navigate" || (acceptHeader && acceptHeader.includes("text/html"));

  // 1. Navegação SPA: Tenta rede, fallback para cache da página ou index.html do App Shell
  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const appShell = await caches.match("/index.html");
          if (appShell) return appShell;
          return createOfflineHtmlResponse();
        })
    );
    return;
  }

  // 2. Requisições ao Catálogo de Livros Supabase: Estratégia Network-First com fallback de cache
  if (url.pathname.includes("/rest/v1/livros")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status < 400) {
            const clone = networkResponse.clone();
            caches.open(CATALOG_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return createOfflineCatalogResponse();
        })
    );
    return;
  }

  // 3. Assets estáticos (JS, CSS, imagens, fontes): Estratégia Stale-While-Revalidate
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => null);

        // Retorna imediatamente do cache (se existir), enquanto revalida em segundo plano
        return cachedResponse || fetchPromise.then((res) => res || caches.match(request));
      })
    );
  }
});
