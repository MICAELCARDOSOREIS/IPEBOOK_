import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useRefocusKey } from "@/view/useRefocusKey";
import ManageListingScreen from "@/view/listings/manageListingScreen";

export default function GerenciarAnuncioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const focusKey = useRefocusKey();

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <ManageListingScreen
        bookId={id}
        focusKey={focusKey}
        onEdit={(bookId) => pushOnce(`/editar-anuncio/${bookId}`)}
        onViewPublicListing={(bookId) => pushOnce(`/livro/${bookId}`)}
        onRemoved={() => replaceOnce("/meus-anuncios")}
        onBack={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
      />
    </RequireAuth>
  );
}
