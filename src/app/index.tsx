import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { pushOnce } from "@/view/pushOnce";
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
      onNavigateToSignIn={() => pushOnce("/entrar")}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToNotifications={() => pushOnce("/notificacoes")}
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
}
