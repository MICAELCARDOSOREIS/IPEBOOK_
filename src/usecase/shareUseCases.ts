import { ValidationError } from "@/model/errors";
import type { BookModality } from "@/model/entities/book";
import type { IShareUseCases, ShareableListing } from "@/usecase/iShareUseCases";

const MODALITY_LABELS: Record<BookModality, string> = {
  sale: "Venda",
  trade: "Troca",
  donation: "Doação",
};

export class ShareUseCases implements IShareUseCases {
  buildListingSharePath(bookId: string): string {
    if (!bookId?.trim()) throw new ValidationError("Anúncio inválido.");
    return `/livro/${bookId.trim()}`;
  }

  buildShareMessage(listing: ShareableListing, url: string): string {
    const priceText =
      listing.modality === "sale" && listing.price ? ` por R$ ${listing.price.toFixed(2)}` : "";
    return `"${listing.title}" de ${listing.author} — ${MODALITY_LABELS[listing.modality]}${priceText}.\nConfira no IpêBook: ${url}`;
  }

  buildWhatsAppShareUrl(message: string): string {
    return `whatsapp://send?text=${encodeURIComponent(message)}`;
  }

  buildInviteMessage(url: string = "https://ipebook.pages.dev"): string {
    const targetUrl = url.trim() || "https://ipebook.pages.dev";
    return `Oi! Estou usando o IpêBook para trocar, vender e doar livros em Piripiri. Dá uma olhada e participa também da nossa comunidade de leitores:\n${targetUrl}`;
  }

  buildWhatsAppInviteUrl(url?: string): string {
    const message = this.buildInviteMessage(url);
    return this.buildWhatsAppShareUrl(message);
  }
}
