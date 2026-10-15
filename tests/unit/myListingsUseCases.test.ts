import { describe, expect, it } from "vitest";
import { BookUseCases } from "@/usecase/bookUseCases";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { AuthError } from "@/model/errors";
import type { Book } from "@/model/entities/book";

const fakeBooks: Book[] = [
  {
    id: "b1",
    title: "O Alquimista",
    author: "Paulo Coelho",
    modality: "trade",
    ownerId: "user-1",
    status: "available",
  },
  {
    id: "b2",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    modality: "sale",
    price: 25,
    ownerId: "user-2",
    status: "available",
  },
  {
    id: "b3",
    title: "Capitães da Areia",
    author: "Jorge Amado",
    modality: "donation",
    ownerId: "user-1",
    status: "reserved",
  },
];

describe("Caso de uso: listMyListings (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("lança AuthError se a sessão for nula ou vazia", async () => {
    const ds = new MemoryBookDataSource(fakeBooks);
    const uc = new BookUseCases(ds);

    await expect(uc.listMyListings(null)).rejects.toThrow(AuthError);
    await expect(uc.listMyListings("")).rejects.toThrow(AuthError);
  });

  it("retorna apenas os livros do usuário autenticado", async () => {
    const ds = new MemoryBookDataSource(fakeBooks);
    const uc = new BookUseCases(ds);

    const user1Books = await uc.listMyListings("user-1");
    expect(user1Books).toHaveLength(2);
    expect(user1Books.map((b) => b.id)).toEqual(["b1", "b3"]);

    const user2Books = await uc.listMyListings("user-2");
    expect(user2Books).toHaveLength(1);
    expect(user2Books[0].id).toBe("b2");

    const user3Books = await uc.listMyListings("user-sem-livros");
    expect(user3Books).toHaveLength(0);
  });
});
