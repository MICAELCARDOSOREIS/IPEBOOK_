import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import Home from "@/view/home";

export default function Index() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusKey((key) => key + 1);
    }, []),
  );

  const homeContent = (
    <Home
      focusKey={focusKey}
      onNavigateToSignIn={() => pushOnce("/entrar")}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToNotifications={() => pushOnce("/notificacoes")}
      onNavigateToConversations={() => pushOnce("/meus-pedidos")}
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
  // No app móvel nativo, mantém o fluxo da Spec 092.
  if (Platform.OS === "web") {
    return homeContent;
  }

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/bem-vindo")}>
      {homeContent}
    </RequireAuth>
  );
}
