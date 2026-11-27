import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Platform } from "react-native";
import { colors, type ColorPalette } from "@/view/tokens";

export type ThemeContextValue = {
  colors: ColorPalette;
};

const defaultValue: ThemeContextValue = {
  colors,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

/** Distribui a paleta de cores do tema claro editorial para a árvore (ADR 0114). Envolver em `src/app/_layout.tsx`. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Na Web e PWA, sincroniza o fundo do documento e a meta tag theme-color com a superfície editorial
  // para evitar vazamento de cores diferentes na status bar e safe area inferior.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.documentElement.style.backgroundColor = colors.surface;
    document.body.style.backgroundColor = colors.surface;
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.style.backgroundColor = colors.surface;
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", colors.surface);
    }
  }, []);

  return (
    <ThemeContext.Provider value={defaultValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Cores do tema claro editorial para o componente atual. */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
