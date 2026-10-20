import { router, useLocalSearchParams } from "expo-router";
import ManageListingScreen from "@/view/listings/manageListingScreen";

export default function GerenciarAnuncioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ManageListingScreen
      bookId={id}
      onEdit={(bookId) => router.push(`/editar-anuncio/${bookId}`)}
      onRemoved={() => router.replace("/meus-anuncios")}
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
    />
  );
}
