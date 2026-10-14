import { describe, expect, it } from "vitest";
import type { IBookRequestDataSource } from "@/model/datasources/iBookRequestDataSource";
import type { Book } from "@/model/entities/book";
import type { BookRequest } from "@/model/entities/bookRequest";

describe("modelo de solicitacao de negociacao", () => {
  it("representa um pedido pendente vinculado ao anuncio e a pessoa solicitante", () => {
    const request: BookRequest = {
      id: "request-1",
      listingId: "listing-1",
      requesterId: "user-1",
      status: "pending",
    };

    expect(request).toEqual({
      id: "request-1",
      listingId: "listing-1",
      requesterId: "user-1",
      status: "pending",
    });
  });

  it("define os contratos de leitura, criacao e resposta de pedidos", async () => {
    const request: BookRequest = {
      id: "request-1",
      listingId: "listing-1",
      requesterId: "user-1",
      status: "pending",
    };
    const dataSource: IBookRequestDataSource = {
      create: async (newRequest) => newRequest,
      listByOwner: async () => [request],
      listByRequester: async () => [request],
      respond: async (id, status) => ({ ...request, id, status }),
    };

    await expect(dataSource.create(request)).resolves.toEqual(request);
    await expect(dataSource.listByOwner("owner-1")).resolves.toEqual([request]);
    await expect(dataSource.listByRequester("user-1")).resolves.toEqual([request]);
    await expect(dataSource.respond("request-1", "accepted")).resolves.toEqual({
      ...request,
      status: "accepted",
    });
  });

  it("exige que anuncios informem se estao disponiveis ou reservados", () => {
    const book: Book = {
      id: "listing-1",
      title: "Quarto de Despejo",
      author: "Carolina Maria de Jesus",
      ownerId: "owner-1",
      modality: "donation",
      status: "available",
    };

    expect(book.status).toBe("available");
  });
});
