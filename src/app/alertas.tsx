import { router, useLocalSearchParams } from "expo-router";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";

export default function SearchAlertsRoute() {
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  return <SearchAlertsScreen initialQuery={termo} onBack={() => router.back()}
      onSearchBooks={() => router.push("/pesquisa")} onLogin={() => router.push({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })} />;
}
