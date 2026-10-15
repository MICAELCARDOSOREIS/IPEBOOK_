import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import Home from "@/view/home";

export default function Index() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusKey((key) => key + 1);
    }, []),
  );

  return (
    <Home
      focusKey={focusKey}
      onNavigateToSignIn={() => router.push("/entrar")}
      onNavigateToCreateListing={() => router.push("/anunciar")}
      onNavigateToMyListings={() => router.push("/meus-anuncios")}
      onNavigateToReceivedRequests={() => router.push("/pedidos-recebidos")}
      onNavigateToSentRequests={() => router.push("/meus-pedidos")}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToTerms={() => router.push("/termos")}
      onNavigateToHelp={() => router.push("/ajuda")}
    />
  );
}
