import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce } from "@/view/pushOnce";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";

export default function SearchAlertsRoute() {
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));
  return <SearchAlertsScreen key={focusKey} initialQuery={termo} onBack={() => backOnce()}
      onSearchBooks={() => pushOnce("/pesquisa")}
      onManageAlert={(id) => pushOnce({ pathname: "/alertas/[id]", params: { id } })}
      onLogin={() => pushOnce({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })} />;
}
