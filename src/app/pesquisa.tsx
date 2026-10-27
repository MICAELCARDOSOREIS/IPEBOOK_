import { useLocalSearchParams } from "expo-router";
import { pushOnce } from "@/view/pushOnce";
import Search, { parseInitialModality } from "@/view/search/search";

export default function Pesquisa() {
  const { modalidade, bairro } = useLocalSearchParams<{ modalidade?: string; bairro?: string }>();

  return (
    <Search
      initialModality={parseInitialModality(modalidade)}
      currentNeighborhood={typeof bairro === "string" ? bairro : undefined}
      onNavigateToBookDetail={(bookId) => pushOnce(`/livro/${bookId}`)}
      onNavigateToAlerts={(term) => pushOnce({ pathname: "/alertas", params: { termo: term } })}
    />
  );
}
