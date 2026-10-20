import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { authUseCases, bookUseCases } from "@/di/container";
import BookDetail from "@/view/listings/bookDetail";

/**
 * SC-005 pela composição real (container → caso de uso → infra em memória): uma pessoa toca em
 * um livro do catálogo, vê seus detalhes e consegue solicitar negociação a partir dessa tela,
 * sem regressão no comportamento já coberto pela spec 004 (ver tests/integration/sc002Integration).
 */
describe("SC-005: ver detalhe do livro e solicitar negociação pela tela de detalhe", () => {
  it("mostra os dados do anúncio e permite solicitar negociação pelas camadas reais", async () => {
    const listing = await bookUseCases.createListing(
      { title: "Torto Arado", author: "Itamar Vieira Junior", modality: "donation" },
      "owner-sc006",
    );
    await authUseCases.signUp("comprador-sc006@exemplo.com", "senhaSegura123", "Leitora Teste");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BookDetail bookId={listing.id} onBack={() => {}} />);
    });

    expect(screen.getAllByText("Torto Arado").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Itamar Vieira Junior").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Doação")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByText("Solicitar negociação"));
    });

    expect(screen.getByText("Negociação solicitada")).toBeDefined();

    await authUseCases.signOut();
  });

  it("mostra mensagem de erro clara para id de livro inexistente (FR-009)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BookDetail bookId="id-inexistente-sc006" onBack={() => {}} />);
    });

    expect(screen.getByRole("alert").props.children).toBe("Anúncio não encontrado.");
  });
});
