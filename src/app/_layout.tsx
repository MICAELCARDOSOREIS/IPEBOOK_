import { useEffect } from "react";
import { Stack, router, usePathname, type ErrorBoundaryProps, type Href } from "expo-router";
import { AppErrorFallback, startErrorReporting } from "@/view/components/AppErrorFallback";
import { pushOnce, replaceOnce } from "@/view/pushOnce";
import * as ScreenOrientation from "expo-screen-orientation";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useIpebookFonts } from "@/view/useIpebookFonts";
import { ConnectedNavigationBar } from "@/view/components/ConnectedNavigationBar";
import { ConnectedWebHeader } from "@/view/components/ConnectedWebHeader";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { pageTitleFor } from "@/view/pageTitle";
import type { NavigationDestination } from "@/view/components/NavigationBar";
import { PwaRegister } from "@/view/components/PwaRegister";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";
import { ThemeProvider, useTheme } from "@/view/theme/ThemeProvider";
import { KeyboardAwareRoot } from "@/view/components/KeyboardAwareRoot";
import { WEB_BETA_ONLY, webBetaRedirect } from "@/view/webBetaMode";

/** Rotas de nível superior (ADR 0011) — rotas de fluxo (entrar, anunciar, etc.) não entram aqui. */
const ROOT_DESTINATIONS: Record<string, NavigationDestination> = {
  "/": "home",
  "/pesquisa": "search",
  "/meus-anuncios": "shelf",
  "/meus-pedidos": "conversations",
  "/perfil": "profile",
};

/** Telas de acesso e boas-vindas têm o próprio topo (painel da marca), sem o cabeçalho do app. */
const AUTH_ROUTES = new Set(["/bem-vindo", "/sobre", "/entrar", "/criar-conta", "/esqueci-senha", "/redefinir-senha", "/auth/callback", "/beta"]);

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

// Acompanhamento de erros (Spec 104): sem EXPO_PUBLIC_SENTRY_DSN, não envia nada.
startErrorReporting();

/** Uma tela que quebra mostra o aviso amigável em vez de fechar o app (expo-router). */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} retry={retry} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useIpebookFonts();
  const pathname = usePathname();
  const activeDestination = ROOT_DESTINATIONS[pathname];
  const wideWeb = useIsWideWeb();
  const navigateTo = (destination: NavigationDestination) => {
    const targetRoute = DESTINATION_ROUTES[destination];
    // Previne navegação duplicada verificando se já estamos na rota
    if (pathname !== targetRoute) pushOnce(targetRoute);
  };

  // Trava o app em retrato em runtime (a app.json já trava em builds nativos; isto é a rede de
  // segurança em Expo Go/dev). Web fica livre — lá o conteúdo é centralizado com maxWidth.
  useEffect(() => {
    if (Platform.OS === "web") return;
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
      /* dispositivo/emulador sem suporte à trava: ignora silenciosamente */
    });
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
    <ThemeProvider>
      <ThemedStatusBar />
      <InitialRouteGate pathname={pathname} onShowWelcome={() => replaceOnce("/bem-vindo")}>
        <KeyboardAwareRoot>
          {wideWeb && !WEB_BETA_ONLY && !AUTH_ROUTES.has(pathname) ? (
            <ConnectedWebHeader
              active={activeDestination}
              pathname={pathname}
              onNavigate={navigateTo}
              onAnnounce={() => pushOnce("/anunciar")}
              onOpenNotifications={() => pushOnce("/notificacoes")}
            />
          ) : null}
          <Stack screenOptions={{ headerShown: false }} />
          {activeDestination && !wideWeb && !WEB_BETA_ONLY ? (
            <ConnectedNavigationBar active={activeDestination} pathname={pathname} onNavigate={navigateTo} />
          ) : null}
        </KeyboardAwareRoot>
      </InitialRouteGate>
    </ThemeProvider>
  );
}
