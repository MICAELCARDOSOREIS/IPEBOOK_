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
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToNotifications={() => router.push("/notificacoes")}
      onNavigateToSearch={(filter) => {
        const params: Record<string, string> = {};
        if (filter?.modality) params.modalidade = filter.modality;
        if (filter?.neighborhood) params.bairro = filter.neighborhood;
        router.push(
          Object.keys(params).length > 0
            ? { pathname: "/pesquisa", params }
            : "/pesquisa",
        );
      }}
    />
  );
}
