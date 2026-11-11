import { Platform } from "react-native";

/**
 * Modo Web completo com autenticação obrigatória (Spec 092 e Spec 108):
 * O site completo fica liberado na Web para pessoas autenticadas.
 * O catálogo, perfil, anúncios e navegação exigem estar conectado com o login (RequireAuth).
 * Sem login ativo, o usuário é direcionado para entrar/criar conta.
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
