import { router } from "expo-router";
import Search from "@/view/search/search";

export default function Pesquisa() {
  return <Search onNavigateToBookDetail={(bookId) => router.push(`/livro/${bookId}`)}
    onNavigateToAlerts={(term) => router.push({ pathname: "/alertas", params: { termo: term } })} />;
}
