import { beforeEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import type { Book } from "@/model/entities/book";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";

const listing: Book = {
  id: "listing-1",
  title: "Quarto de Despejo",
  author: "Carolina Maria de Jesus",
  ownerId: "owner",
  modality: "donation",
  status: "available",
};

describe("negociação simples (spec 004)", () => {
  let books: MemoryBookDataSource;
  let requests: MemoryBookRequestDataSource;
  let useCases: BookRequestUseCases;

  beforeEach(() => {
    books = new MemoryBookDataSource([
      listing,
      { ...listing, id: "listing-2", ownerId: "other-owner" },
    ]);
    requests = new MemoryBookRequestDataSource();
    useCases = new BookRequestUseCases(books, requests);
  });

  describe("requestNegotiation", () => {
    it("cria pedido pendente para anúncio de outra pessoa", async () => {
      const created = await useCases.requestNegotiation("listing-1", "alice");
      expect(created).toMatchObject({ listingId: "listing-1", requesterId: "alice", status: "pending" });
      expect(created.id).toBeTruthy();
    });

    it("exige sessão", async () => {
      await expect(useCases.requestNegotiation("listing-1", null)).rejects.toBeInstanceOf(AuthError);
    });

    it("bloqueia anúncio inexistente", async () => {
      await expect(useCases.requestNegotiation("nope", "alice")).rejects.toBeInstanceOf(ValidationError);
    });

    it("FR-001: bloqueia o dono", async () => {
      await expect(useCases.requestNegotiation("listing-1", "owner")).rejects.toThrow(/próprio anúncio/);
    });

    it("FR-002: bloqueia pedido pendente duplicado", async () => {
      await useCases.requestNegotiation("listing-1", "alice");
      await expect(useCases.requestNegotiation("listing-1", "alice")).rejects.toThrow(/pendente/);
    });

    it("FR-002: permite novo pedido depois de recusado", async () => {
      const first = await useCases.requestNegotiation("listing-1", "alice");
      await useCases.respondToRequest(first.id, "reject", "owner");
      await expect(useCases.requestNegotiation("listing-1", "alice")).resolves.toMatchObject({ status: "pending" });
    });

    it("FR-003: bloqueia anúncio reservado", async () => {
      await books.updateStatus("listing-1", "reserved");
      await expect(useCases.requestNegotiation("listing-1", "alice")).rejects.toThrow(/não está mais disponível/);
    });
  });

  describe("listagens", () => {
    it("lista recebidos só dos meus anúncios, com o anúncio relacionado", async () => {
      await useCases.requestNegotiation("listing-1", "alice");
      await useCases.requestNegotiation("listing-2", "alice");
      const received = await useCases.listReceivedRequests("owner");
      expect(received).toHaveLength(1);
      expect(received[0].listing.id).toBe("listing-1");
      expect(received[0].request.requesterId).toBe("alice");
    });

    it("lista enviados com status atual", async () => {
      const req = await useCases.requestNegotiation("listing-1", "alice");
      await useCases.respondToRequest(req.id, "reject", "owner");
      const sent = await useCases.listSentRequests("alice");
      expect(sent.map((s) => s.request.status)).toEqual(["rejected"]);
      expect(await useCases.listSentRequests("bob")).toEqual([]);
    });

    it("exige sessão nas listagens", async () => {
      await expect(useCases.listReceivedRequests(null)).rejects.toBeInstanceOf(AuthError);
      await expect(useCases.listSentRequests(null)).rejects.toBeInstanceOf(AuthError);
    });
  });

  describe("respondToRequest", () => {
    it("recusar mantém o anúncio disponível", async () => {
      const req = await useCases.requestNegotiation("listing-1", "alice");
      await expect(useCases.respondToRequest(req.id, "reject", "owner")).resolves.toMatchObject({ status: "rejected" });
      expect((await books.findById("listing-1"))?.status).toBe("available");
    });

    it("SC-002/FR-004: aceitar reserva o anúncio e recusa concorrentes pendentes", async () => {
      const a = await useCases.requestNegotiation("listing-1", "alice");
      const b = await useCases.requestNegotiation("listing-1", "bob");
      const c = await useCases.requestNegotiation("listing-1", "carol");
      const otherListing = await useCases.requestNegotiation("listing-2", "dave");

      await expect(useCases.respondToRequest(b.id, "accept", "owner")).resolves.toMatchObject({ status: "accepted" });

      expect((await requests.findById(a.id))?.status).toBe("rejected");
      expect((await requests.findById(c.id))?.status).toBe("rejected");
      expect((await requests.findById(otherListing.id))?.status).toBe("pending");
      expect((await books.findById("listing-1"))?.status).toBe("reserved");
      expect((await books.findById("listing-2"))?.status).toBe("available");
    });

    it("FR-005: bloqueia responder pedido já respondido", async () => {
      const req = await useCases.requestNegotiation("listing-1", "alice");
      await useCases.respondToRequest(req.id, "reject", "owner");
      await expect(useCases.respondToRequest(req.id, "accept", "owner")).rejects.toThrow(/já foi respondido/);
    });

    it("bloqueia quem não é dono do anúncio", async () => {
      const req = await useCases.requestNegotiation("listing-1", "alice");
      await expect(useCases.respondToRequest(req.id, "accept", "alice")).rejects.toBeInstanceOf(AuthError);
      expect((await requests.findById(req.id))?.status).toBe("pending");
    });

    it("exige sessão e pedido existente", async () => {
      await expect(useCases.respondToRequest("x", "accept", null)).rejects.toBeInstanceOf(AuthError);
      await expect(useCases.respondToRequest("x", "accept", "owner")).rejects.toBeInstanceOf(ValidationError);
    });
  });
});

describe("MemoryBookRequestDataSource", () => {
  it("cria, busca, filtra e responde com cópias isoladas", async () => {
    const source = new MemoryBookRequestDataSource();
    const created = await source.create({ listingId: "l1", requesterId: "u1", status: "pending" });
    await source.create({ listingId: "l2", requesterId: "u2", status: "pending" });

    Object.assign(created, { status: "accepted" });
    expect((await source.findById(created.id))?.status).toBe("pending");
    expect(await source.findById("nope")).toBeNull();
    expect((await source.listByListing("l1")).map((r) => r.requesterId)).toEqual(["u1"]);
    expect((await source.listByRequester("u2")).map((r) => r.listingId)).toEqual(["l2"]);
    expect((await source.respond(created.id, "rejected")).status).toBe("rejected");
    expect((await source.findById(created.id))?.status).toBe("rejected");
  });

  it("falha ao responder pedido inexistente", async () => {
    await expect(new MemoryBookRequestDataSource().respond("x", "accepted")).rejects.toBeInstanceOf(DataSourceError);
  });
});

describe("MemoryBookDataSource (negociação)", () => {
  it("busca por id e atualiza status", async () => {
    const source = new MemoryBookDataSource([listing]);
    expect(await source.findById("nope")).toBeNull();
    expect((await source.updateStatus("listing-1", "reserved")).status).toBe("reserved");
    expect((await source.findById("listing-1"))?.status).toBe("reserved");
    await expect(source.updateStatus("nope", "reserved")).rejects.toBeInstanceOf(DataSourceError);
  });
});
