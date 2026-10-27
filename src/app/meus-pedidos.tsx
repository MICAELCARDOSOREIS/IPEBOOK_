import { pushOnce, replaceOnce } from "@/view/pushOnce";
import ConversationsScreen from "@/view/conversations/conversations";

/** Destino "Conversas" da barra de navegação (ADR 0011, Spec 076). */
export default function MeusPedidosRoute() {
  return (
    <ConversationsScreen
      onRequireSignIn={() => replaceOnce("/entrar")}
      onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)}
      onOpenNegotiation={(id) => pushOnce(`/negociacao/${id}`)}
      onOpenReceivedRequests={() => pushOnce("/pedidos-recebidos")}
      onOpenListing={(id) => pushOnce(`/livro/${id}`)}
      onExplore={() => pushOnce("/pesquisa")}
    />
  );
}
