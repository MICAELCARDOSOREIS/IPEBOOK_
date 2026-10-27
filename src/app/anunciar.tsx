import { router, useLocalSearchParams } from "expo-router";
import CreateListingScreen from "@/view/listings/createListingScreen";

export default function AnunciarRoute() {
  const { rascunho } = useLocalSearchParams<{ rascunho?: string }>();
  return (
    <CreateListingScreen
      initialDraftId={typeof rascunho === "string" ? rascunho : undefined}
      onCancel={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onViewMyListings={() => router.replace("/meus-anuncios")}
      onGoHome={() => router.replace("/")}
    />
  );
}
