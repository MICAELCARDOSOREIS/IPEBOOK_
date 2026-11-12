import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { SourceSerif4_700Bold } from "@expo-google-fonts/source-serif-4";

/**
 * Fontes decididas no ADR 0007 (serifa da marca) e no ADR 0107 (Plus Jakarta Sans na interface):
 * Source Serif 4 Bold para a marca e títulos literários; Plus Jakarta Sans para toda a interface,
 * botões, formulários e textos corridos nos pesos 400/500/600.
 */
export const fontFamily = {
  brand: "SourceSerif4_700Bold",
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
} as const;

export function useIpebookFonts() {
  return useFonts({
    SourceSerif4_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });
}
