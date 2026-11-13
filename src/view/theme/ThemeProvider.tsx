import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import { makeThemeViewModel } from "@/di/container";
import type { ThemePreference } from "@/model/entities/themePreference";
import { type ResolvedScheme } from "@/viewmodel/useThemeViewModel";
import { colors, darkColors, type ColorPalette } from "@/view/tokens";

export type ThemeContextValue = {
  preference: ThemePreference;
  resolvedScheme: ResolvedScheme;
  colors: ColorPalette;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const defaultValue: ThemeContextValue = {
  preference: "light",
  resolvedScheme: "light",
  colors,
  setPreference: async () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

/** Distribui o tema resolvido (claro/escuro) para a árvore (ADR 0036). Envolver em `src/app/_layout.tsx`. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, actions] = makeThemeViewModel();
  const resolvedColors = state.resolvedScheme === "dark" ? darkColors : colors;

  // Na Web e PWA, sincroniza o fundo do documento e a meta tag theme-color com o tema ativo
  // para evitar vazamento de cores diferentes na status bar e safe area inferior.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.style.backgroundColor = resolvedColors.surface;
    document.body.style.backgroundColor = resolvedColors.surface;
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.style.backgroundColor = resolvedColors.surface;
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", resolvedColors.surface);
    }
  }, [resolvedColors.surface]);

  return (
    <ThemeContext.Provider
      value={{
        preference: state.preference,
        resolvedScheme: state.resolvedScheme,
        colors: resolvedColors,
        setPreference: actions.setPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/** Cores e tema resolvidos para o componente atual. Fora do `ThemeProvider`, cai no tema claro. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
