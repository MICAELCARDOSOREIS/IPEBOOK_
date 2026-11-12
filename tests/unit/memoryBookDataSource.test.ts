import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import type { Book } from "@/model/entities/book";

describe("MemoryBookDataSource (Spec 068 / ADR 0051)", () => {
  const books: Book[] = [
    {
      id: "b1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      modality: "sale",
      price: 25,
      status: "available",
      ownerId: "u1",
      city: "Piripiri",
      state: "PI",
      neighborhood: "Centro",
    },
    {
      id: "b2",
      title: "Grande Sertão: Veredas",
      author: "Guimarães Rosa",
      modality: "trade",
      status: "available",
      ownerId: "u2",
      city: "Piripiri",
      state: "PI",
      neighborhood: "Crioli",
    },
    {
      id: "b3",
      title: "Capitães da Areia",
      author: "Jorge Amado",
      modality: "donation",
      status: "available",
      ownerId: "u3",
      city: "Piripiri",
      state: "PI",
      neighborhood: "Centro",
    },
    {
      id: "b4",
      title: "Livro Pausado",
      author: "Autor",
      modality: "donation",
      status: "paused",
      ownerId: "u1",
      city: "Piripiri",
      state: "PI",
      neighborhood: "Centro",
    },
  ];

  it("livro entregue sai do catálogo público (Spec 095)", async () => {
    const ds = new MemoryBookDataSource(books);
    await ds.updateStatus("b1", "delivered");
    expect((await ds.list()).map((b) => b.id)).not.toContain("b1");
    expect((await ds.findById("b1"))?.status).toBe("delivered");
  });

  it("filtra livros por bairro", async () => {
    const ds = new MemoryBookDataSource(books);
    const centro = await ds.list({ neighborhood: "Centro" });
    expect(centro).toHaveLength(2);
    expect(centro.map((b) => b.id)).toEqual(["b1", "b3"]);

    const crioli = await ds.list({ neighborhood: "Crioli" });
    expect(crioli).toHaveLength(1);
    expect(crioli[0].id).toBe("b2");
  });

  it("retorna todos os livros disponíveis quando bairro for all ou Todos os bairros", async () => {
    const ds = new MemoryBookDataSource(books);
    const all = await ds.list({ neighborhood: "all" });
    expect(all).toHaveLength(3);

    const todos = await ds.list({ neighborhood: "Todos os bairros (Piripiri)" });
    expect(todos).toHaveLength(3);
  });

  it("combina filtro de bairro e modalidade", async () => {
    const ds = new MemoryBookDataSource(books);
    const resultado = await ds.list({ neighborhood: "Centro", modality: "donation" });
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("b3");
  });

  it("retorna lista vazia quando nenhum livro corresponde ao bairro", async () => {
    const ds = new MemoryBookDataSource(books);
    const vazio = await ds.list({ neighborhood: "Petecas" });
    expect(vazio).toHaveLength(0);
  });
});
