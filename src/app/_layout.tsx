import { Stack, router, usePathname, type Href } from "expo-router";
import { View } from "react-native";
import { useIpebookFonts } from "@/view/useIpebookFonts";
import { NavigationBar, type NavigationDestination } from "@/view/components/NavigationBar";

/** Rotas de nível superior (ADR 0011) — rotas de fluxo (entrar, anunciar, etc.) não entram aqui. */
const ROOT_DESTINATIONS: Record<string, NavigationDestination> = {
  "/": "home",
  "/pesquisa": "search",
  "/perfil": "profile",
};

/**
 * "/perfil" ainda não existe como rota (é da issue #55) — o item Perfil da barra já aponta para
 * lá, conforme combinado em #56, e passa a resolver quando #55 criar `src/app/perfil.tsx`.
 */
const DESTINATION_ROUTES: Record<NavigationDestination, Href> = {
  home: "/",
  search: "/pesquisa",
  profile: "/perfil" as Href,
};

export default function RootLayout() {
  const [fontsLoaded] = useIpebookFonts();
  const pathname = usePathname();
  const activeDestination = ROOT_DESTINATIONS[pathname];

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {activeDestination ? (
        <NavigationBar
          active={activeDestination}
          disabledDestinations={["profile"]}
          onNavigate={(destination) => router.push(DESTINATION_ROUTES[destination])}
        />
      ) : null}
    </View>
  );
}
