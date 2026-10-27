import { useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import ManageListingScreen from "@/view/listings/manageListingScreen";

export default function GerenciarAnuncioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ManageListingScreen
      bookId={id}
      onEdit={(bookId) => pushOnce(`/editar-anuncio/${bookId}`)}
      onRemoved={() => replaceOnce("/meus-anuncios")}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
    />
  );
}
