import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import MyListingsScreen from "@/view/listings/myListings";

export default function MeusAnunciosRoute() {
  const focusKey = useRefocusKey();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <MyListingsScreen
        focusKey={focusKey}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onNavigateToCreateListing={() => pushOnce("/anunciar")}
        onNavigateToDrafts={() => pushOnce("/rascunhos" as never)}
        onNavigateToHelp={() => pushOnce("/ajuda")}
        onNavigateToManageListing={(bookId) => pushOnce(`/gerenciar-anuncio/${bookId}` as never)}
        onNavigateToReceivedRequests={() => pushOnce("/pedidos-recebidos")}
        onNavigateToNegotiationDetail={(requestId) => pushOnce(`/conversa/${requestId}` as never)}
      />
    </RequireAuth>
  );
}
