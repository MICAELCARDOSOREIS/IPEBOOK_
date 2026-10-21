import { useCallback, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";

export default function SearchAlertsRoute() {
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));
  return <SearchAlertsScreen key={focusKey} initialQuery={termo} onBack={() => router.back()}
      onSearchBooks={() => router.push("/pesquisa")}
      onManageAlert={(id) => router.push({ pathname: "/alertas/[id]", params: { id } })}
      onLogin={() => router.push({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })} />;
}
