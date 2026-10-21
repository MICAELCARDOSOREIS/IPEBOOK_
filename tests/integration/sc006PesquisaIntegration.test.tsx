import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { bookUseCases } from "@/di/container";
import Search from "@/view/search/search";

/**
 * SC-002 (Issue #56): uma pessoa filtra o catálogo por título/autor na tela de Pesquisa, pelas
 * camadas reais (container → caso de uso → infra em memória), sem precisar de sessão.
 */
describe("SC-002: filtrar o catálogo por título/autor pelas camadas reais", () => {
  it("mostra só os livros cujo título ou autor correspondem ao termo buscado", async () => {
    await bookUseCases.createListing(
      { title: "Torto Arado", author: "Itamar Vieira Junior", modality: "donation" },
      "owner-sc006-pesquisa-1",
    );
    await bookUseCases.createListing(
      { title: "Quarto de Despejo", author: "Carolina Maria de Jesus", modality: "donation" },
      "owner-sc006-pesquisa-2",
    );

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(React.createElement(Search));
    });

    expect(screen.getByText("Torto Arado")).toBeDefined();
    expect(screen.getByText("Quarto de Despejo")).toBeDefined();

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Buscar livros"), "Torto");
    });

    expect(screen.getByText("Torto Arado")).toBeDefined();
    expect(screen.queryByText("Quarto de Despejo")).toBeNull();
  });
});
