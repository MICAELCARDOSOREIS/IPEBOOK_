import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import CreateListingScreen from "@/view/listings/createListingScreen";

export default function AnunciarRoute() {
  const { rascunho } = useLocalSearchParams<{ rascunho?: string }>();
  return (
    <CreateListingScreen
      initialDraftId={typeof rascunho === "string" ? rascunho : undefined}
      onCancel={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onViewMyListings={() => replaceOnce("/meus-anuncios")}
      onGoHome={() => replaceOnce("/")}
    />
  );
}
