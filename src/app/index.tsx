import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import { MainTabsPager } from "@/view/components/MainTabsPager";
import { useMainTabsState } from "@/view/mainTabsState";
import Home from "@/view/home";
import Search from "@/view/search/search";
import MyListingsScreen from "@/view/listings/myListings";

export default function Index() {
  const [focusKey, setFocusKey] = useState(0);
  const { scrollToTopTicks } = useMainTabsState();
  useFocusEffect(
    useCallback(() => {
      setFocusKey((key) => key + 1);
    }, []),
  );

  const homeContent = (
    <Home
      focusKey={focusKey}
      scrollToTopTick={scrollToTopTicks.home}
      onNavigateToSignIn={() => pushOnce("/entrar")}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToNotifications={() => pushOnce("/notificacoes")}
      onNavigateToConversations={() => pushOnce("/meus-pedidos")}
      onNavigateToCreateListing={() => pushOnce("/anunciar")}
      onNavigateToProfile={() => pushOnce("/perfil")}
      onNavigateToHelp={() => pushOnce("/ajuda")}
      onNavigateToTerms={() => pushOnce("/termos")}
      onNavigateToSearch={(filter) => {
        const params: Record<string, string> = {};
        if (filter?.modality) params.modalidade = filter.modality;
        if (filter?.neighborhood) params.bairro = filter.neighborhood;
        pushOnce(
          Object.keys(params).length > 0
            ? { pathname: "/pesquisa", params }
            : "/pesquisa",
        );
      }}
    />
  );

  // Na Web, o catálogo comunitário é livre para qualquer visitante navegar sem exigir login prévio.
  // No app móvel nativo, mantém o fluxo da Spec 092 e habilita o arraste 1:1 entre abas (Spec 144).
  if (Platform.OS === "web") {
    return homeContent;
  }

  const searchContent = (
    <Search
      focusKey={focusKey}
      scrollToTopTick={scrollToTopTicks.search}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToFavorites={() => pushOnce("/favoritos")}
    />
  );

  const shelfContent = (
    <MyListingsScreen
      focusKey={focusKey}
      scrollToTopTick={scrollToTopTicks.shelf}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onNavigateToCreateListing={() => pushOnce("/anunciar")}
      onNavigateToDrafts={() => pushOnce("/rascunhos" as never)}
      onNavigateToHelp={() => pushOnce("/ajuda")}
      onNavigateToManageListing={(bookId) => pushOnce(`/gerenciar-anuncio/${bookId}` as never)}
      onNavigateToReceivedRequests={() => pushOnce("/pedidos-recebidos")}
      onNavigateToNegotiationDetail={(requestId) => pushOnce(`/conversa/${requestId}` as never)}
    />
  );

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/bem-vindo")}>
      <MainTabsPager
        homeContent={homeContent}
        searchContent={searchContent}
        shelfContent={shelfContent}
      />
    </RequireAuth>
  );
}
