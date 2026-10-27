import { useEffect } from "react";
import { Stack, router, usePathname, type Href } from "expo-router";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useIpebookFonts } from "@/view/useIpebookFonts";
import { ConnectedNavigationBar } from "@/view/components/ConnectedNavigationBar";
import type { NavigationDestination } from "@/view/components/NavigationBar";
import { PwaRegister } from "@/view/components/PwaRegister";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";
import { ThemeProvider, useTheme } from "@/view/theme/ThemeProvider";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";

/** Rotas de nível superior (ADR 0011) — rotas de fluxo (entrar, anunciar, etc.) não entram aqui. */
const ROOT_DESTINATIONS: Record<string, NavigationDestination> = {
  "/": "home",
  "/pesquisa": "search",
  "/meus-anuncios": "shelf",
  "/meus-pedidos": "conversations",
  "/perfil": "profile",
};

const DESTINATION_ROUTES: Record<NavigationDestination, Href> = {
  home: "/",
  search: "/pesquisa",
  shelf: "/meus-anuncios",
  conversations: "/meus-pedidos",
  profile: "/perfil" as Href,
};

/** Ícones da barra de status seguem o tema do app (preferência da pessoa), não só o do sistema. */
function ThemedStatusBar() {
  const { resolvedScheme } = useTheme();
  return <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useIpebookFonts();
  const pathname = usePathname();
  const activeDestination = ROOT_DESTINATIONS[pathname];

  // Trava o app em retrato em runtime (a app.json já trava em builds nativos; isto é a rede de
  // segurança em Expo Go/dev). Web fica livre — lá o conteúdo é centralizado com maxWidth.
  useEffect(() => {
    if (Platform.OS === "web") return;
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
      /* dispositivo/emulador sem suporte à trava: ignora silenciosamente */
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <InitialRouteGate pathname={pathname} onShowWelcome={() => replaceOnce("/bem-vindo")}>
        <KeyboardAwareRoot>
          <Stack screenOptions={{ headerShown: false }} />
          {activeDestination ? (
            <ConnectedNavigationBar
              active={activeDestination}
              pathname={pathname}
              onNavigate={(destination) => {
                const targetRoute = DESTINATION_ROUTES[destination];
                // Previne navegação duplicada verificando se já estamos na rota
                if (pathname !== targetRoute) {
                  pushOnce(targetRoute);
                }
              }}
            />
          ) : null}
        </KeyboardAwareRoot>
      </InitialRouteGate>
    </ThemeProvider>
  );
}
