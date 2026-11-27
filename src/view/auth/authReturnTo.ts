import type { Href } from "expo-router";

const STORAGE_KEY = "auth_return_to";
const AUTH_PATHS = new Set(["/entrar", "/criar-conta", "/auth/callback", "/esqueci-senha", "/redefinir-senha"]);

export function getInternalAuthReturnTo(destination: unknown): Extract<Href, string> | undefined {
  if (typeof destination !== "string" || !destination.startsWith("/")) return undefined;
  const pathname = destination.split(/[?#]/, 1)[0];
  try {
    const decoded = decodeURIComponent(pathname);
    const segments = decoded.split("/");
    if (decoded.startsWith("//") || decoded.includes("\\") || /\s/.test(decoded)
      || segments.some((segment) => segment === "." || segment === "..")
      || AUTH_PATHS.has(decoded.replace(/\/+$/, ""))) return undefined;
    return destination as Extract<Href, string>;
  } catch {
    return undefined;
  }
}

/** Guarda o próximo destino do fluxo OAuth nesta aba. */
export function setAuthReturnTo(destination: string | undefined): void {
  if (typeof window === "undefined") return;
  try {
    const valid = getInternalAuthReturnTo(destination);
    if (valid !== undefined) window.sessionStorage.setItem(STORAGE_KEY, valid);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/** Lê e consome o destino temporário do fluxo OAuth. */
export function consumeAuthReturnTo(fallback: Href = "/"): Href {
  if (typeof window === "undefined") return fallback;
  try {
    const destination = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return getInternalAuthReturnTo(destination) ?? fallback;
  } catch {
    return fallback;
  }
}
