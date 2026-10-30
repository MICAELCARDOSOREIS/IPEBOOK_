import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import SearchAlertsScreen from "@/view/search/searchAlertsScreen";

export default function SearchAlertsRoute() {
  const { termo } = useLocalSearchParams<{ termo?: string }>();
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((value) => value + 1); }, []));
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })}>
      <SearchAlertsScreen
        key={focusKey}
        initialQuery={termo}
        onBack={() => backOnce()}
        onSearchBooks={() => pushOnce("/pesquisa")}
        onManageAlert={(id) => pushOnce({ pathname: "/alertas/[id]", params: { id } })}
        onLogin={() => pushOnce({ pathname: "/entrar", params: { retorno: "alertas", termo: termo ?? "" } })}
      />
    </RequireAuth>
  );
}
