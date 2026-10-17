export type BookModality = "sale" | "trade" | "donation";

export type Book = Readonly<{
  id: string;
  title: string;
  author: string;
  category?: string;
  ownerId: string;
  modality: BookModality;
  price?: number;
  status: "available" | "reserved";
  city?: string;
  state?: string;
  neighborhood?: string;
  photoUrl?: string;
  photos?: readonly string[];
}>;
