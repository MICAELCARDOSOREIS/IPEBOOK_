import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import Home from "@/view/home";
import { PushRegistration } from "@/view/components/PushRegistration";

export default function Index() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocusKey((key) => key + 1);
    }, []),
  );

  return (
    // Início exige conta: sem sessão, volta às boas-vindas, mesmo destino do portão de
    // primeiro acesso (replaceOnce deduplica) — Spec 092.
    <RequireAuth onRequireSignIn={() => replaceOnce("/bem-vindo")}>
      <PushRegistration onOpenRoute={(route) => pushOnce(route as never)} />
      <Home
        focusKey={focusKey}
        onNavigateToSignIn={() => pushOnce("/entrar")}
        onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
        onNavigateToNotifications={() => pushOnce("/notificacoes")}
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
    </RequireAuth>
  );
}
