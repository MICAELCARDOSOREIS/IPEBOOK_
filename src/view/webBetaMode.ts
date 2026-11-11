import { Platform } from "react-native";

/**
 * Spec 108: por enquanto o site só divulga o teste do app Android. Na web não há catálogo nem
 * cadastro; `/excluir-conta` fica acessível pelo endereço, porque a Play Store exige um link
 * público para excluir a conta.
 * Para reabrir o site completo no futuro, desligar `WEB_BETA_ONLY` aqui.
 */
export const WEB_BETA_ONLY = false;

const ROTAS_LIBERADAS = new Set([
  "/bem-vindo",
  "/sobre",
  "/beta",
  "/ajuda",
  "/termos",
  "/excluir-conta",
  "/auth/callback",
]);

/** Para onde mandar quem abre `pathname` no site; `null` quando a página pode abrir. */
export function webBetaRedirect(pathname: string, enabled: boolean = WEB_BETA_ONLY): "/bem-vindo" | null {
  if (!enabled || ROTAS_LIBERADAS.has(pathname)) return null;
  return "/bem-vindo";
}
