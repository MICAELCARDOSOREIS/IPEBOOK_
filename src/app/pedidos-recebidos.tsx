import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import ReceivedRequestsScreen from "@/view/requests/receivedRequests";

export default function PedidosRecebidosRoute() {
  return (
    <ReceivedRequestsScreen
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onNavigateToNegotiationDetail={(id) => pushOnce(`/negociacao/${id}`)}
    />
  );
}
