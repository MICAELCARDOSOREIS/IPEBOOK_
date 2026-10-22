import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
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
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onScheduleMeeting={() => router.push(`/negociacao/${id}/encontro` as never)}
    />
  );
}
