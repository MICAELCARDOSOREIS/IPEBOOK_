import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { BookRequestUseCases } from "@/usecase/bookRequestUseCases";
import { RequestDetail } from "@/view/requests/requestDetail";

describe("Integração: Detalhes da Negociação Aceita (Spec 009)", () => {
  it("permite acesso apenas aos participantes da negociação pelas camadas reais", async () => {
    const bookDataSource = new MemoryBookDataSource([
      {
        id: "book-1",
        title: "Capitães da Areia",
        author: "Jorge Amado",
        modality: "trade",
        ownerId: "dono-user",
        status: "available",
      },
    ]);
    const requestDataSource = new MemoryBookRequestDataSource();
    const requestUseCases = new BookRequestUseCases(bookDataSource, requestDataSource);

    // 1. Solicitante faz pedido
    const pedido = await requestUseCases.requestNegotiation("book-1", "comprador-user");

    // 2. Dono aceita pedido
    await requestUseCases.respondToRequest(pedido.id, "accept", "dono-user");

    // 3. Dono consulta detalhes
    const detalheDono = await requestUseCases.getRequestDetail(pedido.id, "dono-user");
    expect(detalheDono.book.title).toBe("Capitães da Areia");
    expect(detalheDono.request.status).toBe("accepted");
    expect(detalheDono.isOwner).toBe(true);
    expect(detalheDono.counterpartId).toBe("comprador-user");
    expect(detalheDono.safeMeetingPoints).toContain("Campus IFPI Piripiri (Recepção ou Biblioteca)");

    // 4. Comprador consulta detalhes
    const detalheComprador = await requestUseCases.getRequestDetail(pedido.id, "comprador-user");
    expect(detalheComprador.isOwner).toBe(false);
    expect(detalheComprador.counterpartId).toBe("dono-user");

    // 5. Terceiro é bloqueado
    await expect(requestUseCases.getRequestDetail(pedido.id, "invasor")).rejects.toThrow(
      "Você não tem permissão para acessar esta negociação.",
    );
  });

  it("renderiza a interface RequestDetail integrada sem falhas", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <RequestDetail requestId="qualquer-id" sessionUserId="qualquer-user" />,
      );
    });

    expect(screen.getByRole("header", { name: "Acompanhar encontro" })).toBeDefined();
  });
});
