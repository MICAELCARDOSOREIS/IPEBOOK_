import { makeAuthViewModel } from "@/di/container";
import Favorites from "@/view/favorites/favorites";

export type FavoritesScreenProps = {
  focusKey?: number;
  onBack: () => void;
  onLogin: () => void;
  onBook: (id: string) => void;
  onNavigateToAlerts?: () => void;
  /** Ação do estado vazio; sem ela o botão "Explorar livros" cairia no retorno. */
  onExploreBooks: () => void;
};

export default function FavoritesScreen(props: FavoritesScreenProps) {
  const [auth] = makeAuthViewModel();
  return <Favorites {...props} userId={auth.user?.id ?? null} />;
}
