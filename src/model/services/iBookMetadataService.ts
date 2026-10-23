import type { BookMetadata } from "@/model/entities/bookMetadata";

export interface IBookMetadataService {
  /**
   * Consulta os metadados públicos de um livro a partir de seu código ISBN.
   * Retorna null se não encontrado ou se o ISBN for inválido.
   */
  lookupByIsbn(isbn: string): Promise<BookMetadata | null>;
}
