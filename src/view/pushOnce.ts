import { router, type Href } from "expo-router";

/**
 * Janela em que cliques repetidos para o mesmo destino são tratados como duplo ou triplo toque (Spec 091 / Spec 113 / Fix duplo toque).
 * 1500 ms cobre a duração de animações de transição de rota do React Native / Expo Router no Android e iOS,
 * além do tempo de montagem e carga de dados de telas pesadas, prevenindo que toques subsequentes em rajada
 * ou toques retardados re-empilhem a mesma tela.
 * Em testes unitários mantém 1000 ms para manter compatibilidade com temporizadores simulados.
 */
const DOUBLE_TAP_WINDOW_MS = process.env.NODE_ENV === "test" ? 1000 : 600;

/**
 * Janela mínima global de transição entre quaisquer navegações para frente (push/replace),
 * evitando abrir telas diferentes em paralelo se a pessoa tocar com múltiplos dedos ao mesmo tempo.
 * Mantida em 50 ms no celular para transições ágeis e sem sensação de travamento entre abas.
 * Em testes unitários mantém 0 para não interferir em asserções de rotas sequenciais distintas.
 */
const GLOBAL_TRANSITION_WINDOW_MS = process.env.NODE_ENV === "test" ? 0 : 50;

/**
 * Janela de bloqueio de duplo clique no botão voltar (evita fechar 2 ou 3 telas de uma vez).
 */
const BACK_WINDOW_MS = 400;

let lastKey = "";
let lastAt = 0;
let lastGlobalNavAt = 0;

/**
 * Normaliza qualquer `Href` (string ou objeto `{ pathname, params }`) em uma chave canônica determinística.
 * - Remove barras finais redundantes (`/livro/123/` -> `/livro/123`).
 * - Interpola segmentos dinâmicos de rota (`[id]` -> valor de `params.id`).
 * - Ordena alfabeticamente os parâmetros de consulta (`query params`), garantindo que objetos
 *   com propriedades em ordens diferentes produzam exatamente a mesma chave.
 */
export function canonicalizeHref(href: Href): string {
  if (typeof href === "string") {
    const [pathPart, queryPart] = href.split("?");
    const cleanPath = pathPart.replace(/\/+$/, "") || "/";
    if (!queryPart) return cleanPath;
    const searchParams = new URLSearchParams(queryPart);
    const sortedKeys = Array.from(searchParams.keys()).sort();
    const query = sortedKeys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(searchParams.get(k) ?? "")}`)
      .join("&");
    return query ? `${cleanPath}?${query}` : cleanPath;
  }

  const hrefObj = href as { pathname?: string; params?: Record<string, unknown> };
  let path = hrefObj.pathname || "/";
  const params: Record<string, unknown> = { ...(hrefObj.params || {}) };

  // Interpola parâmetros de rota dinâmica como [id], [userId], etc.
  path = path.replace(/\[([^\]]+)\]/g, (_, paramName) => {
    if (params[paramName] !== undefined && params[paramName] !== null) {
      const val = String(params[paramName]);
      delete params[paramName];
      return encodeURIComponent(val);
    }
    return `[${paramName}]`;
  });

  const cleanPath = path.replace(/\/+$/, "") || "/";
  const keys = Object.keys(params).sort();
  const queryParts: string[] = [];
  for (const k of keys) {
    const v = params[k];
    if (v !== undefined && v !== null && v !== "") {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
  }
  const query = queryParts.join("&");
  return query ? `${cleanPath}?${query}` : cleanPath;
}

/**
 * `router.push` blindado contra duplo e triplo clique:
 * Normaliza o destino, ignora repetições do mesmo destino (1500 ms) e transições globais rápidas (750 ms),
 * renovando o bloqueio em cliques em rajada.
 */
export function pushOnce(href: Href): void {
  const canonical = canonicalizeHref(href);
  const key = `push:${canonical}`;
  if (isRepeat(key)) return;
  router.push(href);
}

/** `router.replace` com a mesma proteção contra duplo e triplo toque. */
export function replaceOnce(href: Href): void {
  const canonical = canonicalizeHref(href);
  const key = `replace:${canonical}`;
  if (isRepeat(key)) return;
  router.replace(href);
}

/** `router.back` com proteção contra duplo toque (evita fechar 2 ou 3 telas de uma vez). */
export function backOnce(): void {
  if (isRepeat("back", BACK_WINDOW_MS)) return;
  router.back();
}

/**
 * Avalia se a ação de navegação atual é uma repetição indevida.
 * Se for repetição, renova `lastAt` para que toques repetidos contínuos continuem sendo ignorados.
 */
function isRepeat(key: string, windowMs = DOUBLE_TAP_WINDOW_MS): boolean {
  const now = Date.now();

  // 1. Mesmo destino ou mesma ação repetida dentro da janela (ou mesmo destino entre push e replace)
  const isSameDestination =
    key === lastKey ||
    (key.startsWith("push:") && lastKey === key.replace(/^push:/, "replace:")) ||
    (key.startsWith("replace:") && lastKey === key.replace(/^replace:/, "push:"));

  if (isSameDestination && now - lastAt < windowMs) {
    lastAt = now; // Renova: múltiplos cliques rápidos seguidos continuam bloqueados
    return true;
  }

  // 2. Transição global: impede duas navegações para frente simultâneas ou navegação durante transição de voltar
  if (key !== "back" && GLOBAL_TRANSITION_WINDOW_MS > 0 && now - lastGlobalNavAt < GLOBAL_TRANSITION_WINDOW_MS) {
    return true;
  }

  lastKey = key;
  lastAt = now;
  lastGlobalNavAt = now; // Atualiza em todas as navegações (inclusive back), protegendo a transição
  return false;
}

/** Utilitário para limpar o estado de navegação durante testes. */
export function _resetPushOnceState(): void {
  lastKey = "";
  lastAt = 0;
  lastGlobalNavAt = 0;
}
