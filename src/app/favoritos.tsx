import { router } from "expo-router";
import FavoritesScreen from "@/view/favorites/favoritesScreen";

export default function FavoritesRoute() {
  return <FavoritesScreen onBack={() => router.back()} onLogin={() => router.push({ pathname: "/entrar", params: { retorno: "favoritos" } })}
    onBook={(id) => router.push(`/livro/${id}`)} />;
}
