import { router } from "expo-router";
import DraftsScreen from "@/view/listings/drafts";

export default function RascunhosRoute() {
  return (
    <DraftsScreen
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onResume={(bookId) => router.push(`/anunciar?rascunho=${bookId}` as never)}
      onNavigateToCreateListing={() => router.push("/anunciar")}
    />
  );
}
