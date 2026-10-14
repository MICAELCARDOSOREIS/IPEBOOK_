import { useFonts } from "expo-font";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
} from "@expo-google-fonts/roboto";
import { SourceSerif4_700Bold } from "@expo-google-fonts/source-serif-4";

/**
 * Fontes decididas no ADR 0007 (serifa da marca) e no design-kit: Source Serif 4 Bold para a
 * marca, Roboto para a interface. Roboto Flex (nome usado no design-kit) só distribui o corte
 * estático Regular pelo Google Fonts/Expo; por isso o app usa Roboto (família próxima, com os
 * pesos 400/500/600 que a tipografia dos tokens exige) em vez de Roboto Flex.
 */
export const fontFamily = {
  brand: "SourceSerif4_700Bold",
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  semiBold: "Roboto_600SemiBold",
} as const;

export function useIpebookFonts() {
  return useFonts({
    SourceSerif4_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
  });
}
