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
      onNavigateToSearch={(filter) =>
        router.push(
          filter?.modality
            ? { pathname: "/pesquisa", params: { modalidade: filter.modality } }
            : "/pesquisa",
        )
      }
    />
  );
}
