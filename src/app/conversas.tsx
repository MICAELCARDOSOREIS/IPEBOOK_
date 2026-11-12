import { useCallback, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ConversationsScreen from "@/view/conversations/conversations";

/** Rota de alias /conversas -> /meus-pedidos para evitar 404 em notificações e deep links. */
export default function ConversasRoute() {
  const [focusKey, setFocusKey] = useState(0);
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      setFocusKey((key) => key + 1);
    }, []),
  );
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ConversationsScreen
        focusKey={focusKey}
        onBack={() => {
          if (router.canGoBack()) backOnce();
          else replaceOnce("/");
        }}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)}
        onOpenNegotiation={(id) => pushOnce(`/negociacao/${id}`)}
        onReportListing={(id) => pushOnce(`/denunciar/${id}`)}
        onOpenReceivedRequests={() => pushOnce("/pedidos-recebidos")}
        onOpenListing={(id) => pushOnce(`/livro/${id}`)}
        onExplore={() => pushOnce("/pesquisa")}
      />
    </RequireAuth>
  );
}
