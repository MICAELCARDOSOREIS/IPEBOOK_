import type { BookModality } from "@/model/entities/book";

export type ShareableListing = Readonly<{
  title: string;
  author: string;
  modality: BookModality;
  price?: number;
}>;

export interface IShareUseCases {
  buildListingSharePath(bookId: string): string;
  /** Texto em português com título, autor, modalidade e link, para WhatsApp e demais redes. */
  buildShareMessage(listing: ShareableListing, url: string): string;
  /** URL do esquema `whatsapp://send` com o texto já codificado. */
  buildWhatsAppShareUrl(message: string): string;
  /** Mensagem convidando amigos para a comunidade de leitores em Piripiri (Figma 08.02). */
  buildInviteMessage(url?: string): string;
  /** URL do esquema `whatsapp://send` com a mensagem de convite da comunidade. */
  buildWhatsAppInviteUrl(url?: string): string;
}
