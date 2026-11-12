import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import CreateListingScreen from "@/view/listings/createListingScreen";

export default function AnunciarRoute() {
  const { rascunho } = useLocalSearchParams<{ rascunho?: string }>();
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <CreateListingScreen
        initialDraftId={typeof rascunho === "string" ? rascunho : undefined}
        onCancel={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
        onViewMyListings={() => replaceOnce("/meus-anuncios")}
        onGoHome={() => replaceOnce("/")}
      />
    </RequireAuth>
  );
}
