import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
// @ts-expect-error Exportado pelo mock de react-native
import { Platform, StyleSheet, __emitKeyboardEvent } from "react-native";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";

describe("NeighborhoodSelectorModal (Spec 067 / ADR 0050)", () => {
  afterEach(() => {
    cleanup();
  });

  it("não renderiza conteúdo quando visible é falso", async () => {
    const { queryByText } = await render(
      <NeighborhoodSelectorModal
        visible={false}
        currentNeighborhood="all"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(queryByText("Locais em Piripiri")).toBeNull();
  });

  it("renderiza os pontos de encontro e a opção 'Todos os locais' quando visível", async () => {
    const { getByText, getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="all"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(getByText("Locais em Piripiri")).toBeDefined();
    expect(getByLabelText("Selecionar todos os locais de Piripiri")).toBeDefined();
    expect(getByLabelText("Selecionar ponto de encontro Campus IFPI Piripiri")).toBeDefined();
    expect(getByLabelText("Selecionar ponto de encontro Praça da Bandeira")).toBeDefined();
    expect(getByLabelText("Selecionar ponto de encontro Museu de Piripiri")).toBeDefined();
    expect(getByLabelText("Selecionar ponto de encontro Praça de Eventos")).toBeDefined();
  });

  it("filtra a lista de locais ao digitar no campo de busca", async () => {
    const { getByPlaceholderText, getByLabelText, queryByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="all"
        onSelect={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    const input = getByPlaceholderText("Buscar ponto de encontro");
    await React.act(async () => {
      fireEvent.changeText(input, "bandeira");
    });

    expect(getByLabelText("Selecionar ponto de encontro Praça da Bandeira")).toBeDefined();
    expect(queryByLabelText("Selecionar ponto de encontro Campus IFPI Piripiri")).toBeNull();
  });

  it("chama onSelect ao tocar em um ponto de encontro", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="all"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );

    const bandeiraBtn = getByLabelText("Selecionar ponto de encontro Praça da Bandeira");
    fireEvent.press(bandeiraBtn);

    expect(onSelect).toHaveBeenCalledWith("Praça da Bandeira");
  });

  it("chama onClose ao tocar no botão fechar", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await render(
      <NeighborhoodSelectorModal
        visible={true}
        currentNeighborhood="all"
        onSelect={jest.fn()}
        onClose={onClose}
      />,
    );

    const closeBtn = getByLabelText("Fechar seletor de locais");
    fireEvent.press(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("desvia a lista de locais acima do teclado no Android quando keyboardDidShow dispara", async () => {
    const originalPlatform = Platform.OS;
    Platform.OS = "android";
    try {
      const { getByTestId } = await render(
        <NeighborhoodSelectorModal
          visible={true}
          currentNeighborhood="all"
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />,
      );

      const readPaddingBottom = () => {
        const estilo = StyleSheet.flatten(getByTestId("neighborhood-selector-scrim").props.style);
        return estilo.paddingBottom?.__getValue?.() ?? 0;
      };

      expect(readPaddingBottom()).toBe(0);
      await React.act(async () => {
        __emitKeyboardEvent("keyboardDidShow", 300);
      });
      expect(readPaddingBottom()).toBe(300);
      await React.act(async () => {
        __emitKeyboardEvent("keyboardDidHide", undefined);
      });
      expect(readPaddingBottom()).toBe(0);
    } finally {
      Platform.OS = originalPlatform;
    }
  });
});
