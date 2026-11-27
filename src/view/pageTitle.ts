const APP_NAME = "IpêBook";

const TITLES: Record<string, string> = {
  "/": "Início",
  "/pesquisa": "Pesquisa",
  "/meus-anuncios": "Minha estante",
  "/meus-pedidos": "Conversas",
  "/conversas": "Conversas",
  "/pedidos-recebidos": "Pedidos recebidos",
  "/perfil": "Perfil",
  "/perfil/configuracoes": "Configurações",
  "/perfil/editar": "Editar perfil",
  "/perfil/avaliacoes": "Avaliações",
  "/perfil/encontros": "Meus encontros",
  "/perfil/bloqueados": "Contas bloqueadas",
  "/perfil/seguranca": "Segurança",
  "/perfil/convidar": "Convidar amigos",
  "/favoritos": "Favoritos",
  "/notificacoes": "Notificações",
  "/alertas": "Alertas",
  "/anunciar": "Anunciar livro",
  "/rascunhos": "Rascunhos",
  "/moderacao": "Moderação",
  "/excluir-conta": "Excluir conta",
  "/ajuda": "Ajuda",
  "/termos": "Termos de uso",
  "/sobre": "Sobre",
  "/bem-vindo": "Bem-vindo",
  "/entrar": "Entrar",
  "/criar-conta": "Criar conta",
  "/esqueci-senha": "Esqueci a senha",
  "/redefinir-senha": "Redefinir senha",
  "/auth/callback": "Concluir autenticação",
  "/beta": "Teste o app Android",
};

const DYNAMIC_TITLES: readonly (readonly [RegExp, string])[] = [
  [/^\/alertas\/[^/]+\/editar$/, "Editar alerta"],
  [/^\/alertas\/[^/]+$/, "Gerenciar alerta"],
  [/^\/conversa\/[^/]+$/, "Conversa"],
  [/^\/denunciar-pessoa\/[^/]+$/, "Denunciar pessoa"],
  [/^\/denunciar\/[^/]+$/, "Denunciar anúncio"],
  [/^\/editar-anuncio\/[^/]+$/, "Editar anúncio"],
  [/^\/gerenciar-anuncio\/[^/]+$/, "Gerenciar anúncio"],
  [/^\/livro\/[^/]+$/, "Detalhes do livro"],
  [/^\/negociacao\/[^/]+\/encontro$/, "Combinar encontro"],
  [/^\/negociacao\/[^/]+\/entrega$/, "Entrega do livro"],
  [/^\/negociacao\/[^/]+$/, "Negociação"],
  [/^\/perfil\/[^/]+$/, "Perfil de membro"],
];

/** O detalhe substitui o título inicial assim que identifica o livro. */
export function pageTitleFor(pathname: string): string {
  const title = TITLES[pathname]
    ?? DYNAMIC_TITLES.find(([pattern]) => pattern.test(pathname))?.[1]
    ?? "Página não encontrada";
  return `${title} · ${APP_NAME}`;
}
