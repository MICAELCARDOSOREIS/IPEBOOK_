import { router } from "expo-router";
import CreateListingScreen from "@/view/listings/createListingScreen";

export default function AnunciarRoute() {
  return (
    <CreateListingScreen
      onCancel={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onViewMyListings={() => router.replace("/meus-anuncios")}
      onGoHome={() => router.replace("/")}
    />
  );
}
