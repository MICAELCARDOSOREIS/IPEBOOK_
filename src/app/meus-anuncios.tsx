import { pushOnce, replaceOnce } from "@/view/pushOnce";
import MyListingsScreen from "@/view/listings/myListings";

export default function MeusAnunciosRoute() {
  return (
    <MyListingsScreen
      onRequireSignIn={() => replaceOnce("/entrar")}
      onNavigateToCreateListing={() => pushOnce("/anunciar")}
      onNavigateToDrafts={() => pushOnce("/rascunhos" as never)}
      onNavigateToHelp={() => pushOnce("/ajuda")}
      onNavigateToManageListing={(bookId) => pushOnce(`/gerenciar-anuncio/${bookId}` as never)}
      onNavigateToReceivedRequests={() => pushOnce("/pedidos-recebidos")}
      onNavigateToNegotiationDetail={(requestId) => pushOnce(`/negociacao/${requestId}` as never)}
    />
  );
}
