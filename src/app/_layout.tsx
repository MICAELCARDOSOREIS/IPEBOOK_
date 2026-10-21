import { Stack, router, usePathname, type Href } from "expo-router";
import { View } from "react-native";
import { useIpebookFonts } from "@/view/useIpebookFonts";
import { NavigationBar, type NavigationDestination } from "@/view/components/NavigationBar";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";

/** Rotas de nível superior (ADR 0011) — rotas de fluxo (entrar, anunciar, etc.) não entram aqui. */
const ROOT_DESTINATIONS: Record<string, NavigationDestination> = {
  "/": "home",
  "/pesquisa": "search",
  "/perfil": "profile",
};

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
    <InitialRouteGate pathname={pathname} onShowWelcome={() => router.replace("/bem-vindo")}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        {activeDestination ? (
          <NavigationBar
            active={activeDestination}
            onNavigate={(destination) => router.push(DESTINATION_ROUTES[destination])}
          />
        ) : null}
      </View>
    </InitialRouteGate>
  );
}
