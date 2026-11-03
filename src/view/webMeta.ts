import { Platform } from "react-native";
import type { OpenGraphMetadata } from "@/model/formatters/openGraphFormatter";

/**
 * Atualiza dinamicamente as tags <meta property="og:..."> e o <title> no DOM da Web.
 * Em ambientes nativos (iOS/Android) a chamada é no-op segura.
 */
export function updateWebSocialMeta(meta: OpenGraphMetadata): void {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return;
  }

  document.title = meta.title;

  function setMetaTag(attributeName: "property" | "name", attributeValue: string, content: string) {
    let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  }

  setMetaTag("property", "og:title", meta.title);
  setMetaTag("property", "og:description", meta.description);
  setMetaTag("property", "og:image", meta.image);
  setMetaTag("property", "og:url", meta.url);
  setMetaTag("property", "og:type", meta.type);
  setMetaTag("property", "og:site_name", meta.siteName);
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", meta.title);
  setMetaTag("name", "twitter:description", meta.description);
  setMetaTag("name", "twitter:image", meta.image);
}
