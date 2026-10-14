import { router } from "expo-router";
import Home from "@/view/home";

export default function Index() {
  return (
    <Home
      onNavigateToSignIn={() => router.push("/entrar")}
      onNavigateToCreateListing={() => router.push("/anunciar")}
      onNavigateToReceivedRequests={() => router.push("/pedidos-recebidos")}
      onNavigateToSentRequests={() => router.push("/meus-pedidos")}
    />
  );
}
