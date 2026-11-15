import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import ReceivedRequestsScreen from "@/view/requests/receivedRequests";

export default function PedidosRecebidosRoute() {
  const focusKey = useRefocusKey();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ReceivedRequestsScreen
        focusKey={focusKey}
        onBack={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onNavigateToNegotiationDetail={(id) => pushOnce(`/negociacao/${id}`)}
        onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)}
      />
    </RequireAuth>
  );
}
