export type BookModality = "sale" | "trade" | "donation";
export type BookStatus = "available" | "reserved" | "paused";

export type Book = Readonly<{
  id: string;
  title: string;
  author: string;
  category?: string;
  ownerId: string;
  modality: BookModality;
  price?: number;
  status: BookStatus;
  city?: string;
  state?: string;
  neighborhood?: string;
  photoUrl?: string;
  photos?: readonly string[];
}>;
