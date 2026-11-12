import { afterEach, describe, expect, it } from "vitest";
import { Platform } from "react-native";
import { updateWebSocialMeta } from "@/view/webMeta";
import type { OpenGraphMetadata } from "@/model/formatters/openGraphFormatter";

describe("webMeta (Spec 119)", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    (Platform as { OS: string }).OS = originalPlatform;
    delete (globalThis as { document?: unknown }).document;
  });

  it("em plataformas móveis (ios/android), não quebra e opera como no-op seguro", () => {
    (Platform as { OS: string }).OS = "ios";
    expect(() =>
      updateWebSocialMeta({
        title: "Título",
        description: "Descrição",
        image: "https://site.com/foto.jpg",
        url: "https://site.com",
        type: "book",
        siteName: "IpêBook",
      }),
    ).not.toThrow();
  });

  it("na Web com document presente, atualiza o title e cria tags meta no head", () => {
    (Platform as { OS: string }).OS = "web";

    const headElements: Array<{ attributeName: string; attributeValue: string; content: string }> = [];
    const mockDocument = {
      title: "",
      head: {
        appendChild: (el: unknown) => el,
      },
      querySelector: (selector: string) => {
        const match = selector.match(/meta\[(property|name)="([^"]+)"\]/);
        if (!match) return null;
        const found = headElements.find(
          (e) => e.attributeName === match[1] && e.attributeValue === match[2],
        );
        if (!found) return null;
        return {
          getAttribute: (attr: string) => (attr === "content" ? found.content : null),
          setAttribute: (attr: string, val: string) => {
            if (attr === "content") found.content = val;
          },
        };
      },
      createElement: (tag: string) => {
        if (tag !== "meta") return {};
        const metaObj = {
          attributeName: "",
          attributeValue: "",
          content: "",
          setAttribute: (attr: string, val: string) => {
            if (attr === "property" || attr === "name") {
              metaObj.attributeName = attr;
              metaObj.attributeValue = val;
            } else if (attr === "content") {
              metaObj.content = val;
            }
          },
          getAttribute: (attr: string) => (attr === "content" ? metaObj.content : null),
        };
        headElements.push(metaObj);
        return metaObj;
      },
    };

    (globalThis as { document?: unknown }).document = mockDocument;

    const meta: OpenGraphMetadata = {
      title: "Grande Sertão: Veredas · Guimarães Rosa | IpêBook Piripiri",
      description: "🔄 Disponível para troca no bairro Centro, Piripiri - PI.",
      image: "https://imagens.exemplo.com/grande-sertao.jpg",
      url: "https://ipebook.app/livro/100",
      type: "book",
      siteName: "IpêBook Piripiri",
    };

    updateWebSocialMeta(meta);

    expect(mockDocument.title).toBe(meta.title);

    const ogTitle = mockDocument.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe(meta.title);

    const ogDesc = mockDocument.querySelector('meta[property="og:description"]');
    expect(ogDesc?.getAttribute("content")).toBe(meta.description);

    const ogImage = mockDocument.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute("content")).toBe(meta.image);

    const ogUrl = mockDocument.querySelector('meta[property="og:url"]');
    expect(ogUrl?.getAttribute("content")).toBe(meta.url);
  });
});
