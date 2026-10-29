import { router } from "expo-router";
import SentRequestsScreen from "@/view/requests/sentRequests";

export default function MeusPedidosRoute() {
  return (
    <SentRequestsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToNegotiationDetail={(id) => router.push(`/negociacao/${id}`)}
    />
  );
}
