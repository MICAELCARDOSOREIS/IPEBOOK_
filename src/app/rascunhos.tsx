import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import DraftsScreen from "@/view/listings/drafts";

export default function RascunhosRoute() {
  // Voltar de Anunciar com "Salvar para depois" recarrega a lista (antes mostrava a lista antiga).
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((key) => key + 1); }, []));
  return (
    <DraftsScreen
      focusKey={focusKey}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onResume={(bookId) => pushOnce(`/anunciar?rascunho=${bookId}` as never)}
      onNavigateToCreateListing={() => pushOnce("/anunciar")}
    />
  );
}
