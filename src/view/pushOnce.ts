import { router, type Href } from "expo-router";

/** Janela em que um segundo toque para o mesmo destino é tratado como duplo toque. */
const DOUBLE_TAP_WINDOW_MS = 400;

let lastKey = "";
let lastAt = 0;

/**
 * `router.push` que ignora o mesmo destino pedido de novo logo em seguida: duplo toque abria a tela
 * duas vezes e era preciso voltar duas vezes (Spec 091).
 */
export function pushOnce(href: Href): void {
  if (isRepeat(`push:${typeof href === "string" ? href : JSON.stringify(href)}`)) return;
  router.push(href);
}

/** `router.replace` com a mesma proteção contra duplo toque. */
export function replaceOnce(href: Href): void {
  if (isRepeat(`replace:${typeof href === "string" ? href : JSON.stringify(href)}`)) return;
  router.replace(href);
}

/** `router.back` com a mesma proteção: dois toques em Voltar fechavam duas telas de uma vez. */
export function backOnce(): void {
  if (isRepeat("back")) return;
  router.back();
}

function isRepeat(key: string): boolean {
  const now = Date.now();
  if (key === lastKey && now - lastAt < DOUBLE_TAP_WINDOW_MS) return true;
  lastKey = key;
  lastAt = now;
  return false;
}
