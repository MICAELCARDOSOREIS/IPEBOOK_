/**
 * Modo Web ativo com aplicativo completo (catálogo, busca, anúncios, negociações e autenticação).
 * Conforme Spec 108, para reabrir o site completo, desliga-se WEB_BETA_ONLY aqui.
 * Quando false, todas as rotas operam normalmente na web com ConnectedWebHeader e ConnectedNavigationBar.
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
