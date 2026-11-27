import { Platform } from "react-native";
import { makeAuthViewModel, makeNavigationBadgesViewModel } from "@/di/container";
import { NavigationBar, type NavigationBarProps } from "@/view/components/NavigationBar";
import { useKeyboardVisible } from "@/view/useKeyboardVisible";

export type ConnectedNavigationBarProps = Omit<NavigationBarProps, "badges"> & {
  /** Rota atual: ao mudar de tela os selos são recalculados. */
  pathname: string;
};

/** Barra de navegação com os selos (propostas esperando resposta em "Conversas", Spec 091). */
export function ConnectedNavigationBar({ pathname, ...props }: ConnectedNavigationBarProps) {
  const [auth] = makeAuthViewModel();
  const isKeyboardVisible = useKeyboardVisible();
  // Mantém os selos atualizados via realtime sem disparar requisições de rede concorrentes a cada troca de aba
  const badges = makeNavigationBadgesViewModel(auth.user?.id ?? null, auth.user?.id ?? "");
  if (auth.loading || !auth.user) return null;
  if (Platform.OS !== "web" && isKeyboardVisible) return null;
  return <NavigationBar {...props} badges={badges} />;
}
