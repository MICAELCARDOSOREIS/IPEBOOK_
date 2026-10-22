import { createContext, useContext, type ReactNode } from "react";
import type { ThemePreference } from "@/model/entities/themePreference";
import { useThemeViewModel, type ResolvedScheme } from "@/viewmodel/useThemeViewModel";
import { colors, darkColors, type ColorPalette } from "@/view/tokens";

export type ThemeContextValue = {
  preference: ThemePreference;
  resolvedScheme: ResolvedScheme;
  colors: ColorPalette;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const defaultValue: ThemeContextValue = {
  preference: "system",
  resolvedScheme: "light",
  colors,
  setPreference: async () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultValue);

/** Distribui o tema resolvido (claro/escuro) para a árvore (ADR 0036). Envolver em `src/app/_layout.tsx`. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, actions] = useThemeViewModel();
  const resolvedColors = state.resolvedScheme === "dark" ? darkColors : colors;

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
