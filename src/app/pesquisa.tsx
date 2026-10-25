import { router, useLocalSearchParams } from "expo-router";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade, bairro } = useLocalSearchParams<{ modalidade?: string; bairro?: string }>();

  return (
    <Search
      initialModality={parseInitialModality(modalidade)}
      currentNeighborhood={typeof bairro === "string" ? bairro : undefined}
      onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
      onNavigateToAlerts={(term) => router.push({ pathname: "/alertas", params: { termo: term } })}
    />
  );
}
