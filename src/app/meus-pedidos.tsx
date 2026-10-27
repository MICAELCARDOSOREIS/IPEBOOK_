import { router } from "expo-router";
import ConversationsScreen from "@/view/conversations/conversations";

/** Destino "Conversas" da barra de navegação (ADR 0011, Spec 076). */
export default function MeusPedidosRoute() {
  return (
    <ConversationsScreen
      onRequireSignIn={() => router.replace("/entrar")}
      onOpenChat={(id) => router.push(`/conversa/${id}` as never)}
      onOpenReceivedRequests={() => router.push("/pedidos-recebidos")}
      onOpenListing={(id) => router.push(`/livro/${id}`)}
      onExplore={() => router.push("/pesquisa")}
    />
  );
}
