import { router } from "expo-router";
import ReceivedRequestsScreen from "@/view/requests/receivedRequests";

export default function PedidosRecebidosRoute() {
  return (
    <ReceivedRequestsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToNegotiationDetail={(id) => router.push(`/negociacao/${id}`)}
    />
  );
}
