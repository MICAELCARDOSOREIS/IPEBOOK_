import { makeAuthViewModel, makeNavigationBadgesViewModel } from "@/di/container";
import { NavigationBar, type NavigationBarProps } from "@/view/components/NavigationBar";

export type ConnectedNavigationBarProps = Omit<NavigationBarProps, "badges"> & {
  /** Rota atual: ao mudar de tela os selos são recalculados. */
  pathname: string;
};

/** Barra de navegação com os selos (propostas esperando resposta em "Conversas", Spec 091). */
export function ConnectedNavigationBar({ pathname, ...props }: ConnectedNavigationBarProps) {
  const [auth] = makeAuthViewModel();
  const badges = makeNavigationBadgesViewModel(auth.user?.id ?? null, pathname);
  if (auth.loading || !auth.user) return null;
  return <NavigationBar {...props} badges={badges} />;
}
