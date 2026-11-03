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

  buildWhatsAppShareMessage(listing: ShareableListing, url: string): string {
    const boxText = listing.isBox
      ? ` 📦 Box / Coleção${listing.boxVolumesCount ? ` (${listing.boxVolumesCount} volumes)` : ""}`
      : "";

    let modalityText = "";
    if (listing.modality === "sale") {
      const priceFormatted = listing.price ? `R$ ${listing.price.toFixed(2).replace(".", ",")}` : "";
      modalityText = priceFormatted ? `💰 Venda: ${priceFormatted}` : "💰 Venda";
    } else if (listing.modality === "trade") {
      modalityText = "🔄 Disponível para troca";
    } else {
      modalityText = "🎁 Doação gratuita para quem vai ler";
    }

    const hasNeighborhood =
      listing.neighborhood &&
      listing.neighborhood !== "Todos os bairros (Piripiri)" &&
      listing.neighborhood !== "all";

    const neighborhoodText = hasNeighborhood
      ? `📍 Bairro ${listing.neighborhood}, Piripiri · PI`
      : "📍 Piripiri · PI";

    return [
      `📚 *${listing.title.trim()}*${boxText}`,
      `✍️ Autor(a): ${listing.author.trim()}`,
      `🌿 ${modalityText}`,
      neighborhoodText,
      `🤝 Combine a retirada em um Ponto Seguro da cidade!`,
      ``,
      `👉 Veja fotos e combine a entrega no IpêBook:`,
      url.trim(),
    ].join("\n");
  }

  buildWhatsAppShareUrl(message: string, isWeb: boolean = false): string {
    const encoded = encodeURIComponent(message);
    if (isWeb) {
      return `https://api.whatsapp.com/send?text=${encoded}`;
    }
    return `whatsapp://send?text=${encoded}`;
  }

  buildInviteMessage(url: string = "https://ipebook.app"): string {
    const targetUrl = url.trim() || "https://ipebook.app";
    return `Oi! Estou usando o IpêBook para trocar, vender e doar livros em Piripiri. Dá uma olhada e participa também da nossa comunidade de leitores:\n${targetUrl}`;
  }

  buildWhatsAppInviteUrl(url?: string): string {
    const message = this.buildInviteMessage(url);
    return this.buildWhatsAppShareUrl(message);
  }
}
