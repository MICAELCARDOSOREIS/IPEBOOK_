const APP_NAME = "IpêBook";

const TITLES: Record<string, string> = {
  "/": "Início",
  "/pesquisa": "Pesquisa",
  "/meus-anuncios": "Minha estante",
  "/meus-pedidos": "Conversas",
  "/pedidos-recebidos": "Pedidos recebidos",
  "/perfil": "Perfil",
  "/favoritos": "Favoritos",
  "/notificacoes": "Notificações",
  "/alertas": "Alertas",
  "/anunciar": "Anunciar livro",
  "/rascunhos": "Rascunhos",
  "/ajuda": "Ajuda",
  "/termos": "Termos de uso",
  "/sobre": "Sobre",
  "/bem-vindo": "Bem-vindo",
  "/entrar": "Entrar",
  "/criar-conta": "Criar conta",
  "/esqueci-senha": "Esqueci a senha",
  "/redefinir-senha": "Redefinir senha",
};

/** Título da aba do navegador para a rota atual; rotas sem nome próprio usam só o nome do app. */
export function pageTitleFor(pathname: string): string {
  const title = TITLES[pathname];
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
