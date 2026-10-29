import { describe, expect, it } from "vitest";
import { ShareUseCases } from "@/usecase/shareUseCases";

describe("ShareUseCases — Convite de amigos (Spec 057, Figma 08.02)", () => {
  const useCases = new ShareUseCases();

  it("monta mensagem padrão de convite para a comunidade de Piripiri", () => {
    const message = useCases.buildInviteMessage();
    expect(message).toContain("IpêBook");
    expect(message).toContain("Piripiri");
    expect(message).toContain("https://ipebook.pages.dev");
  });

  it("permite customizar a URL oficial de destino do convite", () => {
    const customUrl = "https://meuapp.com";
    const message = useCases.buildInviteMessage(customUrl);
    expect(message).toContain(customUrl);
  });

  it("monta URL do WhatsApp com a mensagem de convite codificada", () => {
    const url = useCases.buildWhatsAppInviteUrl();
    expect(url.startsWith("whatsapp://send?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("https://ipebook.pages.dev"));
    expect(url).toContain(encodeURIComponent("Piripiri"));
  });
});
