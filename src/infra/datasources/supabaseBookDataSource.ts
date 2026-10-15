import type { IBookDataSource } from "@/model/datasources/iBookDataSource";
import type { Book } from "@/model/entities/book";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type BookRow = {
  id: string;
  title: string;
  author: string;
  owner_id: string;
  modality: Book["modality"];
  price: number | null;
  status: Book["status"];
};

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    ownerId: row.owner_id,
    modality: row.modality,
    ...(row.price === null ? {} : { price: Number(row.price) }),
    status: row.status,
  };
}

export class SupabaseBookDataSource implements IBookDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async list(): Promise<readonly Book[]> {
    const { data, error } = await this.client.from("v2_books").select("id,title,author,owner_id,modality,price,status").order("created_at", { ascending: false });
    if (error) throw new DataSourceError("Não foi possível carregar os livros.");
    return (data as BookRow[]).map(mapBook);
  }

  async create(book: Omit<Book, "id">): Promise<Book> {
    const { data, error } = await this.client.from("v2_books").insert({
      title: book.title,
      author: book.author,
      owner_id: book.ownerId,
      modality: book.modality,
      price: book.price ?? null,
      status: book.status,
    }).select("id,title,author,owner_id,modality,price,status").single();
    if (error || !data) throw new DataSourceError("Não foi possível cadastrar o anúncio.");
    return mapBook(data as BookRow);
  }

  async findById(id: string): Promise<Book | null> {
    const { data, error } = await this.client.from("v2_books").select("id,title,author,owner_id,modality,price,status").eq("id", id).maybeSingle();
    if (error) throw new DataSourceError("Não foi possível consultar o anúncio.");
    return data ? mapBook(data as BookRow) : null;
  }

  async updateStatus(id: string, status: Book["status"]): Promise<Book> {
    const { data, error } = await this.client.from("v2_books").update({ status }).eq("id", id).select("id,title,author,owner_id,modality,price,status").single();
    if (error || !data) throw new DataSourceError("Não foi possível atualizar o anúncio.");
    return mapBook(data as BookRow);
  }

  async listByOwner(ownerId: string): Promise<readonly Book[]> {
    const { data, error } = await this.client
      .from("v2_books")
      .select("id,title,author,owner_id,modality,price,status")
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
