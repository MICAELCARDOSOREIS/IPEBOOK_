import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type BookRow = {
  id: string;
  title: string;
  author: string;
  category: string | null;
  owner_id: string;
  modality: Book["modality"];
  price: number | null;
  status: Book["status"];
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  photo_url?: string | null;
  photos?: string[] | null;
};

const BOOK_COLUMNS = "id,title,author,category,owner_id,modality,price,status,city,state,neighborhood,photo_url,photos";

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    ...(row.category ? { category: row.category } : {}),
    ownerId: row.owner_id,
    modality: row.modality,
    ...(row.price === null || row.price === undefined ? {} : { price: Number(row.price) }),
    status: row.status,
    ...(row.city ? { city: row.city } : {}),
    ...(row.state ? { state: row.state } : {}),
    ...(row.neighborhood ? { neighborhood: row.neighborhood } : {}),
    ...(row.photo_url ? { photoUrl: row.photo_url } : {}),
    ...(row.photos && row.photos.length > 0 ? { photos: row.photos } : {}),
  };
}

export class SupabaseBookDataSource implements IBookDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async list(): Promise<readonly Book[]> {
    const { data, error } = await this.client.from("v2_books").select(BOOK_COLUMNS).order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar os livros.");
    return (data as BookRow[]).map(mapBook);
  }

  async create(book: Omit<Book, "id">): Promise<Book> {
    const { data, error } = await this.client.from("v2_books").insert({
      title: book.title,
      author: book.author,
      category: book.category ?? null,
      owner_id: book.ownerId,
      modality: book.modality,
      price: book.price ?? null,
      status: book.status,
      city: book.city ?? null,
      state: book.state ?? null,
      neighborhood: book.neighborhood ?? null,
      photo_url: book.photoUrl ?? null,
      photos: book.photos ? Array.from(book.photos) : [],
    }).select(BOOK_COLUMNS).single();
    if (error || !data) throw new DataSourceError("Não foi possível cadastrar o anúncio.");
    return mapBook(data as BookRow);
  }

  async findById(id: string): Promise<Book | null> {
    const { data, error } = await this.client.from("v2_books").select(BOOK_COLUMNS).eq("id", id).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível consultar o anúncio.");
    return data ? mapBook(data as BookRow) : null;
  }

  async updateStatus(id: string, status: Book["status"]): Promise<Book> {
    const { data, error } = await this.client.from("v2_books").update({ status }).eq("id", id).select(BOOK_COLUMNS).single();
    if (error || !data) throw new DataSourceError("Não foi possível atualizar o anúncio.");
    return mapBook(data as BookRow);
  }

  async listByOwner(ownerId: string): Promise<readonly Book[]> {
    const { data, error } = await this.client
      .from("v2_books")
      .select(BOOK_COLUMNS)
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar os seus anúncios.");
    return (data as BookRow[]).map(mapBook);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("v2_books").delete().eq("id", id);
    if (error) throw new DataSourceError("Não foi possível excluir o anúncio.");
  }
}
