import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import ReceivedRequestsScreen from "@/view/requests/receivedRequests";

export default function PedidosRecebidosRoute() {
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ReceivedRequestsScreen
        onBack={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onNavigateToNegotiationDetail={(id) => pushOnce(`/negociacao/${id}`)}
        onOpenChat={(id) => pushOnce(`/conversa/${id}` as never)}
      />
    </RequireAuth>
  );
}
