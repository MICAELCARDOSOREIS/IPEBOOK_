import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { backOnce, pushOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import FavoritesScreen from "@/view/favorites/favoritesScreen";

export default function FavoritesRoute() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((key) => key + 1); }, []));
  return (
    <RequireAuth onRequireSignIn={() => replaceOnce({ pathname: "/entrar", params: { retorno: "favoritos" } })}>
      <FavoritesScreen
        focusKey={focusKey}
        onBack={() => backOnce()}
        onLogin={() => pushOnce({ pathname: "/entrar", params: { retorno: "favoritos" } })}
        onBook={(id) => pushOnce(`/livro/${id}`)}
        onNavigateToAlerts={() => pushOnce("/alertas")}
      />
    </RequireAuth>
  );
}
