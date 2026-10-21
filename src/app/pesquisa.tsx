import { router, useLocalSearchParams } from "expo-router";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade } = useLocalSearchParams<{ modalidade?: string }>();

  return (
    <Search
      initialModality={parseInitialModality(modalidade)}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToAlerts={(term) => router.push({ pathname: "/alertas", params: { termo: term } })}
    />
  );
}
