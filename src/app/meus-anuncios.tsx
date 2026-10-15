import { router } from "expo-router";
import MyListingsScreen from "@/view/listings/myListings";

export default function MeusAnunciosRoute() {
  return (
    <MyListingsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToCreateListing={() => router.push("/anunciar")}
    />
  );
}
