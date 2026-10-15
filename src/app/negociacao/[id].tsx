import { router, useLocalSearchParams } from "expo-router";
import RequestDetailScreen from "@/view/requests/requestDetail";

export default function NegociacaoDetalheRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <RequestDetailScreen
      requestId={id}
      onBack={() => router.back()}
      onRequireSignIn={() => router.replace("/entrar")}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
    />
  );
}
