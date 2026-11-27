import { Platform } from "react-native";

/** Gera a URL de rotas para o Apple Maps no iOS e Google Maps no Android/Web. */
export function buildDirectionsUrl(query: string, os: string = Platform.OS): string {
  const encoded = encodeURIComponent(query);
  return os === "ios"
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}
