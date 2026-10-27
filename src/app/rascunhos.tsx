import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import DraftsScreen from "@/view/listings/drafts";

export default function RascunhosRoute() {
  return (
    <DraftsScreen
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onResume={(bookId) => pushOnce(`/anunciar?rascunho=${bookId}` as never)}
      onNavigateToCreateListing={() => pushOnce("/anunciar")}
    />
  );
}
