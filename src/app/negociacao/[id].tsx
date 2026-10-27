import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import RequestDetailScreen from "@/view/requests/requestDetail";

export default function NegociacaoDetalheRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Recarrega o encontro ao voltar de "Combinar encontro" ou "Reagendar".
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));

  return (
    <RequestDetailScreen
      requestId={id}
      focusKey={focusKey}
      onBack={() => backOnce()}
      onRequireSignIn={() => replaceOnce("/entrar")}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onScheduleMeeting={() => pushOnce(`/negociacao/${id}/encontro` as never)}
      onOpenChat={(requestId) => pushOnce(`/conversa/${requestId}` as never)}
    />
  );
}
