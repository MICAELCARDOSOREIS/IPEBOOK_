import { NavigationBar, type NavigationBarProps } from "@/view/components/NavigationBar";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNavigationBadgesViewModel } from "@/viewmodel/useNavigationBadgesViewModel";

export type ConnectedNavigationBarProps = Omit<NavigationBarProps, "badges"> & {
  /** Rota atual: ao mudar de tela os selos são recalculados. */
  pathname: string;
};

/** Barra de navegação com os selos (propostas esperando resposta em "Conversas", Spec 091). */
export function ConnectedNavigationBar({ pathname, ...props }: ConnectedNavigationBarProps) {
  const [auth] = useAuthViewModel();
  const badges = useNavigationBadgesViewModel(auth.user?.id ?? null, pathname);
  if (auth.loading || !auth.user) return null;
  return <NavigationBar {...props} badges={badges} />;
}
