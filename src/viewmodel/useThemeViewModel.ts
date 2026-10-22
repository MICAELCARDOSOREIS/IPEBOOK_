import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { themePreferenceUseCases } from "@/di/container";
import type { ThemePreference } from "@/model/entities/themePreference";
import type { IThemePreferenceUseCases } from "@/usecase/iThemePreferenceUseCases";

export type ResolvedScheme = "light" | "dark";

export type ThemeViewModelState = {
  preference: ThemePreference;
  resolvedScheme: ResolvedScheme;
  loading: boolean;
};

export type ThemeViewModelActions = {
  setPreference: (preference: ThemePreference) => Promise<void>;
};

/** Resolve a preferência salva + o tema do sistema no tema efetivo (ADR 0035). */
export function useThemeViewModel(
  useCases: IThemePreferenceUseCases = themePreferenceUseCases,
): [ThemeViewModelState, ThemeViewModelActions] {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    useCases.getPreference().then((stored) => {
      if (active) {
        setPreferenceState(stored);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [useCases]);

  const setPreference = useCallback(
    async (next: ThemePreference) => {
      setPreferenceState(next);
      await useCases.setPreference(next);
    },
    [useCases],
  );

  const resolvedScheme: ResolvedScheme =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  return [{ preference, resolvedScheme, loading }, { setPreference }];
}
