import { Platform } from "react-native";

/**
 * Spec 108: por enquanto o site só divulga o teste do app Android. Na web não há catálogo nem
 * cadastro; `/entrar` e `/excluir-conta` ficam acessíveis só pelo endereço, porque a Play Store
 * exige um link público para excluir a conta.
 */
export const WEB_BETA_ONLY = Platform.OS === "web";

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
