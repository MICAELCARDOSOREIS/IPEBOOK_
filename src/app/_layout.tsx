import { useEffect, useState } from "react";
import { Stack, usePathname, type ErrorBoundaryProps, type Href } from "expo-router";
import { AppErrorFallback, startErrorReporting } from "@/view/components/AppErrorFallback";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import { StatusBar } from "expo-status-bar";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { useIpebookFonts } from "@/view/useIpebookFonts";
import { ConnectedNavigationBar } from "@/view/components/ConnectedNavigationBar";
import { ConnectedWebHeader } from "@/view/components/ConnectedWebHeader";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { pageTitleFor } from "@/view/pageTitle";
import type { NavigationDestination } from "@/view/components/NavigationBar";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";
import { ThemeProvider, useTheme } from "@/view/theme/ThemeProvider";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";
import { WEB_BETA_ONLY, webBetaRedirect } from "@/view/webBetaMode";
import { BrandSplashScreen } from "@/view/components/BrandSplashScreen";
import { PushRegistration } from "@/view/components/PushRegistration";
import { PwaRegister } from "@/view/components/PwaRegister";
import { AppUpdateGate } from "@/view/components/AppUpdateGate";
import { ConnectionStatusBanner } from "@/view/components/ConnectionStatusBanner";
import { getStackScreenOptions } from "@/view/stackScreenOptions";
import {
  type MainDockTab,
  mainTabsScrollProgress,
  selectMainTab,
  triggerMainTabScrollToTop,
  useMainTabsState,
} from "@/view/mainTabsState";

/** Rotas de nível superior (ADR 0011) — rotas de fluxo (entrar, anunciar, etc.) não entram aqui. */
const ROOT_DESTINATIONS: Record<string, NavigationDestination> = {
  "/": "home",
  "/pesquisa": "search",
  "/meus-anuncios": "shelf",
  "/meus-pedidos": "conversations",
  "/conversas": "conversations",
  "/perfil": "profile",
};

/** Destinos que exibem o dock flutuante de 3 abas no mobile (ADR 0011). */
const DOCK_DESTINATIONS = new Set<NavigationDestination>(["home", "search", "shelf"]);

/** Telas de acesso e boas-vindas têm o próprio topo (painel da marca), sem o cabeçalho do app. */
const AUTH_ROUTES = new Set(["/bem-vindo", "/sobre", "/entrar", "/criar-conta", "/esqueci-senha", "/redefinir-senha", "/auth/callback", "/beta"]);

const DESTINATION_ROUTES: Record<NavigationDestination, Href> = {
  home: "/",
  search: "/pesquisa",
  shelf: "/meus-anuncios",
  conversations: "/meus-pedidos",
  profile: "/perfil" as Href,
};

/** Ícones da barra de status sempre escuros sobre a superfície clara editorial (ADR 0114). */
function ThemedStatusBar() {
  return <StatusBar style="dark" />;
}

function ThemedStack() {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.resolve(AccessibilityInfo?.isReduceMotionEnabled?.())
      .then((enabled) => {
        if (active) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});
    const sub = AccessibilityInfo?.addEventListener?.("reduceMotionChanged", (enabled) => {
      setReduceMotion(Boolean(enabled));
    });
    return () => {
      active = false;
      sub?.remove?.();
    };
  }, []);

  return (
    <Stack
      screenOptions={({ route }) =>
        getStackScreenOptions(route?.name, colors.surface, reduceMotion)
      }
    />
  );
}

// Acompanhamento de erros (Spec 104): sem EXPO_PUBLIC_SENTRY_DSN, não envia nada.
startErrorReporting();

/** Uma tela que quebra mostra o aviso amigável em vez de fechar o app (expo-router). */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} retry={retry} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useIpebookFonts();
  const pathname = usePathname();
  const mainTabs = useMainTabsState();
  const isNativePagerActive = Platform.OS !== "web" && pathname === "/" && mainTabs.pagerMounted;
  const activeDestination = isNativePagerActive ? mainTabs.activeTab : ROOT_DESTINATIONS[pathname];
  const wideWeb = useIsWideWeb();
  const navigateTo = (destination: NavigationDestination) => {
    if (Platform.OS !== "web" && DOCK_DESTINATIONS.has(destination)) {
      const targetTab = destination as MainDockTab;
      if (pathname === "/" && mainTabs.pagerMounted) {
        selectMainTab(targetTab, true);
        return;
      }
    }
    const targetRoute = DESTINATION_ROUTES[destination];
    // Previne navegação duplicada e substitui a rota de topo sem empilhar histórico desnecessário entre abas
    if (pathname !== targetRoute) replaceOnce(targetRoute);
  };
  const handleReselectActive = (destination: NavigationDestination) => {
    if (DOCK_DESTINATIONS.has(destination)) {
      triggerMainTabScrollToTop(destination as MainDockTab);
    }
  };

  // Oculta o botão flutuante de ferramentas de desenvolvimento (FAB Tools) do expo-dev-client
  // para evitar sobreposição nos cabeçalhos e botões da interface.
  useEffect(() => {
    if (Platform.OS !== "web" && typeof __DEV__ !== "undefined" && __DEV__) {
      import("expo-dev-menu")
        .then((DevMenu) => {
          DevMenu.setToolsButtonVisible?.(false);
        })
        .catch(() => {
          /* ignora silenciosamente se o dev-menu não estiver ativo */
        });
    }
  }, []);

  // Web: a aba mostra a tela atual em vez da URL.
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") document.title = pageTitleFor(pathname);
  }, [pathname]);

  // Spec 108: no site, por enquanto, só o convite do beta do app Android.
  const betaRedirect = webBetaRedirect(pathname);
  useEffect(() => {
    if (betaRedirect) replaceOnce(betaRedirect);
  }, [betaRedirect]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider initialMetrics={Platform.OS === "web" ? initialWindowMetrics : undefined}>
      <ThemeProvider>
        <ThemedStatusBar />
        <ConnectionStatusBanner />
        <PwaRegister />
        <PushRegistration pathname={pathname} onOpenRoute={(route) => pushOnce(route as never)} />
        <InitialRouteGate pathname={pathname} onShowWelcome={() => replaceOnce("/bem-vindo")}>
          <KeyboardAwareRoot>
            {wideWeb && !WEB_BETA_ONLY && !AUTH_ROUTES.has(pathname) ? (
              <ConnectedWebHeader
                active={activeDestination}
                pathname={pathname}
                onNavigate={navigateTo}
                onSearch={(term) => pushOnce({ pathname: "/pesquisa", params: { q: term } })}
                onAnnounce={() => pushOnce("/anunciar")}
                onOpenNotifications={() => pushOnce("/notificacoes")}
              />
            ) : null}
            {Platform.OS === "web" ? (
              <View role="main" style={styles.main}>
                <ThemedStack />
              </View>
            ) : <ThemedStack />}
            {activeDestination && DOCK_DESTINATIONS.has(activeDestination) && !wideWeb && !WEB_BETA_ONLY ? (
              <ConnectedNavigationBar
                active={activeDestination}
                pathname={pathname}
                onNavigate={navigateTo}
                onReselectActive={handleReselectActive}
                scrollProgress={isNativePagerActive ? mainTabsScrollProgress : undefined}
              />
            ) : null}
          </KeyboardAwareRoot>
        </InitialRouteGate>
        <BrandSplashScreen />
        <AppUpdateGate />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ main: { flex: 1, minHeight: 0 } });
