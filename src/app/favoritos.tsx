import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import FavoritesScreen from "@/view/favorites/favoritesScreen";

export default function FavoritesRoute() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => { setFocusKey((key) => key + 1); }, []));
  return <FavoritesScreen focusKey={focusKey} onBack={() => router.back()} onLogin={() => router.push({ pathname: "/entrar", params: { retorno: "favoritos" } })}
    onBook={(id) => router.push(`/livro/${id}`)} />;
}
