import { router } from "expo-router";
import MyListingsScreen from "@/view/listings/myListings";

export default function MeusAnunciosRoute() {
  return (
    <MyListingsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToCreateListing={() => router.push("/anunciar")}
      onNavigateToHelp={() => router.push("/ajuda")}
      onNavigateToManageListing={(bookId) => router.push(`/gerenciar-anuncio/${bookId}` as never)}
      onNavigateToReceivedRequests={() => router.push("/pedidos-recebidos")}
      onNavigateToNegotiationDetail={(requestId) => router.push(`/negociacao/${requestId}` as never)}
    />
  );
}
