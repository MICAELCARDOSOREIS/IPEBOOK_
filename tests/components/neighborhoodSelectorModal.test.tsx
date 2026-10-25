import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";

describe("NeighborhoodSelectorModal (Spec 067 / ADR 0050)", () => {
  afterEach(() => {
    cleanup();
  });

  it("não renderiza conteúdo quando visible é falso", async () => {
    const { queryByText } = await render(
      <NeighborhoodSelectorModal
        visible={false}
        currentNeighborhood="Centro"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(queryByText("Escolha seu bairro")).toBeNull();
  });

  it("renderiza os 17 bairros e a opção 'Todos os bairros' quando visível", async () => {
    const { getByText, getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="Centro"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(getByText("Escolha seu bairro")).toBeDefined();
    expect(getByLabelText("Selecionar todos os bairros de Piripiri")).toBeDefined();
    expect(getByLabelText("Selecionar bairro Centro")).toBeDefined();
    expect(getByLabelText("Selecionar bairro Petecas")).toBeDefined();
    expect(getByLabelText("Selecionar bairro Paciência")).toBeDefined();
  });

  it("filtra a lista de bairros ao digitar no campo de busca", async () => {
    const { getByPlaceholderText, getByLabelText, queryByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="Centro"
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const input = getByPlaceholderText("Buscar bairro em Piripiri...");
    await React.act(async () => {
      fireEvent.changeText(input, "pet");
    });

    expect(getByLabelText("Selecionar bairro Petecas")).toBeDefined();
    expect(queryByLabelText("Selecionar bairro Centro")).toBeNull();
  });

  it("chama onSelect ao tocar em um bairro", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="Centro"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    const petecasBtn = getByLabelText("Selecionar bairro Petecas");
    fireEvent.press(petecasBtn);

    expect(onSelect).toHaveBeenCalledWith("Petecas");
  });

  it("chama onClose ao tocar no botão fechar", async () => {
    const onClose = vi.fn();
    const { getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="Centro"
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );

    const closeBtn = getByLabelText("Fechar seletor de bairros");
    fireEvent.press(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
