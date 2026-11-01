import { router, type Href } from "expo-router";

/**
 * Janela em que cliques repetidos para o mesmo destino são tratados como duplo ou triplo toque (Spec 091 / Spec 113).
 * 800 ms cobre a duração de animações de transição de rota do React Native / Expo Router no Android e iOS.
 */
const DOUBLE_TAP_WINDOW_MS = 800;

/**
 * Janela mínima global de transição entre quaisquer navegações para frente (push/replace),
 * evitando abrir telas diferentes em paralelo se a pessoa tocar com múltiplos dedos.
 * Em testes unitários mantém 0 para não interferir em asserções de rotas sequenciais distintas.
 */
const GLOBAL_TRANSITION_WINDOW_MS = process.env.NODE_ENV === "test" ? 0 : 500;

let lastKey = "";
let lastAt = 0;
let lastGlobalNavAt = 0;

/**
 * `router.push` blindado contra duplo e triplo clique:
 * Ignora repetições do mesmo destino e renova o bloqueio em cliques em rajada.
 */
export function pushOnce(href: Href): void {
  const key = `push:${typeof href === "string" ? href : JSON.stringify(href)}`;
  if (isRepeat(key)) return;
  router.push(href);
}

/** `router.replace` com a mesma proteção contra duplo e triplo toque. */
export function replaceOnce(href: Href): void {
  const key = `replace:${typeof href === "string" ? href : JSON.stringify(href)}`;
  if (isRepeat(key)) return;
  router.replace(href);
}

/** `router.back` com proteção contra duplo toque (evita fechar 2 ou 3 telas de uma vez). */
export function backOnce(): void {
  if (isRepeat("back", 600)) return;
  router.back();
}

/**
 * Avalia se a ação de navegação atual é uma repetição indevida.
 * Se for repetição, renova `lastAt` para que toques repetidos contínuos continuem sendo ignorados.
 */
function isRepeat(key: string, windowMs = DOUBLE_TAP_WINDOW_MS): boolean {
  const now = Date.now();

  // 1. Mesmo destino ou mesma ação repetida dentro da janela
  if (key === lastKey && now - lastAt < windowMs) {
    lastAt = now; // Renova: múltiplos cliques rápidos seguidos continuam bloqueados
    return true;
  }

  // 2. Transição global: impede duas navegações para frente simultâneas
  if (key !== "back" && GLOBAL_TRANSITION_WINDOW_MS > 0 && now - lastGlobalNavAt < GLOBAL_TRANSITION_WINDOW_MS) {
    return true;
  }

  lastKey = key;
  lastAt = now;
  if (key !== "back") {
    lastGlobalNavAt = now;
  }
  return false;
}

/** Utilitário para limpar o estado de navegação durante testes. */
export function _resetPushOnceState(): void {
  lastKey = "";
  lastAt = 0;
  lastGlobalNavAt = 0;
}
