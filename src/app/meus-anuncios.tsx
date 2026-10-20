import { router } from "expo-router";
import MyListingsScreen from "@/view/listings/myListings";

export default function MeusAnunciosRoute() {
  return (
    <MyListingsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToCreateListing={() => router.push("/anunciar")}
      onNavigateToEditListing={(bookId) => router.push(`/editar-anuncio/${bookId}` as never)}
      onNavigateToManageListing={(bookId) => router.push(`/gerenciar-anuncio/${bookId}` as never)}
    />
  );
}
