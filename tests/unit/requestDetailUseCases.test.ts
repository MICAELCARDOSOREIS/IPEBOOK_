import { describe, expect, it } from "vitest";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";

const fakeBook: Book = {
  id: "book-1",
  title: "Vidas Secas",
  author: "Graciliano Ramos",
  modality: "sale",
  price: 20,
  ownerId: "dono-1",
  status: "reserved",
};

const fakeRequest: BookRequest = {
  id: "req-1",
  listingId: "book-1",
  requesterId: "interessado-1",
  status: "accepted",
};

describe("Caso de uso: getRequestDetail (ISO/IEC 25010 - Adequação e Segurança)", () => {
  it("exige sessão autenticada", async () => {
    const uc = new BookRequestUseCases(
      new MemoryBookDataSource([fakeBook]),
      new MemoryBookRequestDataSource([fakeRequest]),
    );

    await expect(uc.getRequestDetail("req-1", null)).rejects.toThrow(AuthError);
  });

  it("bloqueia acesso de usuário terceiro não participante da negociação", async () => {
    const uc = new BookRequestUseCases(
      new MemoryBookDataSource([fakeBook]),
      new MemoryBookRequestDataSource([fakeRequest]),
    );

    await expect(uc.getRequestDetail("req-1", "invasor-terceiro")).rejects.toThrow(
      "Você não tem permissão para acessar esta negociação.",
    );
  });

  it("permite acesso ao dono do livro e identifica o interessado", async () => {
    const uc = new BookRequestUseCases(
      new MemoryBookDataSource([fakeBook]),
      new MemoryBookRequestDataSource([fakeRequest]),
    );

    const detail = await uc.getRequestDetail("req-1", "dono-1");
    expect(detail.book.title).toBe("Vidas Secas");
    expect(detail.isOwner).toBe(true);
    expect(detail.counterpartId).toBe("interessado-1");
    expect(detail.safeMeetingPoints.length).toBeGreaterThan(0);
  });

  it("permite acesso ao solicitante e identifica o dono do livro", async () => {
    const uc = new BookRequestUseCases(
      new MemoryBookDataSource([fakeBook]),
      new MemoryBookRequestDataSource([fakeRequest]),
    );

    const detail = await uc.getRequestDetail("req-1", "interessado-1");
    expect(detail.book.title).toBe("Vidas Secas");
    expect(detail.isOwner).toBe(false);
    expect(detail.counterpartId).toBe("dono-1");
  });

  it("lança erro se o pedido não existir", async () => {
    const uc = new BookRequestUseCases(
      new MemoryBookDataSource([fakeBook]),
      new MemoryBookRequestDataSource([]),
    );

    await expect(uc.getRequestDetail("req-inexistente", "dono-1")).rejects.toThrow(
      ValidationError,
    );
  });
});
