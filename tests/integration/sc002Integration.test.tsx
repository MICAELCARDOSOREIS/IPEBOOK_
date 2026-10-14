import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { bookRequestUseCases, bookUseCases } from "@/di/container";
import { ReceivedRequests } from "@/view/requests/receivedRequests";
import { SentRequests } from "@/view/requests/sentRequests";

/**
 * SC-001/SC-002 pela composição real (container → caso de uso → infra em memória) e pela
 * tela de pedidos recebidos: aceitar um pedido recusa os concorrentes e reserva o anúncio.
 */
describe("SC-002: aceitar pedido recusa concorrentes e reserva o anúncio", () => {
  it("cobre o fluxo pelas camadas reais e pela interface", async () => {
    const listing = await bookUseCases.createListing(
      { title: "Capitães da Areia", author: "Jorge Amado", modality: "donation" },
      "owner-sc002",
    );
    const alice = await bookRequestUseCases.requestNegotiation(listing.id, "alice-sc002");
    const bob = await bookRequestUseCases.requestNegotiation(listing.id, "bob-sc002");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ReceivedRequests sessionUserId="owner-sc002" />); });
    expect(screen.getAllByText("Aceitar")).toHaveLength(2);

    await act(async () => { fireEvent.press(screen.getAllByText("Aceitar")[0]); });

    expect(screen.queryByText("Aceitar")).toBeNull();
    expect(screen.getByText("Aceito")).toBeDefined();
    expect(screen.getByText("Recusado")).toBeDefined();

    const books = await bookUseCases.listBooks();
    expect(books.find((b) => b.id === listing.id)?.status).toBe("reserved");

    const statuses = [
      ...(await bookRequestUseCases.listSentRequests("alice-sc002")),
      ...(await bookRequestUseCases.listSentRequests("bob-sc002")),
    ].map((i) => [i.request.id, i.request.status]);
    expect(Object.fromEntries(statuses)).toEqual(
      expect.objectContaining({ [alice.id]: expect.any(String), [bob.id]: expect.any(String) }),
    );
    expect(statuses.map(([, s]) => s).sort()).toEqual(["accepted", "rejected"]);

    await expect(bookRequestUseCases.requestNegotiation(listing.id, "carol-sc002")).rejects.toThrow(
      /não está mais disponível/,
    );

    let sent!: Awaited<ReturnType<typeof render>>;
    await act(async () => { sent = await render(<SentRequests sessionUserId="bob-sc002" />); });
    expect(sent.getByText("Capitães da Areia")).toBeDefined();
  });
});
