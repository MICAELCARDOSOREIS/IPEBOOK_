import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import ConversationsScreen from "@/view/conversations/conversations";

/** Destino "Conversas" da barra de navegação (ADR 0011, Spec 076). */
export default function MeusPedidosRoute() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((key) => key + 1); }, []));
  return (
    <ConversationsScreen
      focusKey={focusKey}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)}
      onOpenNegotiation={(id) => pushOnce(`/negociacao/${id}`)}
      onReportListing={(id) => pushOnce(`/denunciar/${id}`)}
      onOpenReceivedRequests={() => pushOnce("/pedidos-recebidos")}
      onOpenListing={(id) => pushOnce(`/livro/${id}`)}
      onExplore={() => pushOnce("/pesquisa")}
    />
  );
}
