import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import Favorites from "@/view/favorites/favorites";

export type FavoritesScreenProps = { focusKey?: number; onBack: () => void; onLogin: () => void; onBook: (id: string) => void };
export default function FavoritesScreen(props: FavoritesScreenProps) {
  const [auth] = useAuthViewModel();
  return <Favorites {...props} userId={auth.user?.id ?? null} />;
}
