import { router, useLocalSearchParams } from "expo-router";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";

export default function SearchAlertsRoute() {
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  return <SearchAlertsScreen initialQuery={termo} onBack={() => router.back()} onLogin={() => router.push({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })} />;
}
