import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react-native";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";

describe("AddPhotoCard (design-system/04-componentes/cartao-de-adicionar-foto.md)", () => {
  it("mostra o rótulo padrão e deriva o rótulo acessível dele", async () => {
    const { getByText, getByLabelText } = await render(<AddPhotoCard onPress={() => {}} />);
    expect(getByText("Foto da capa")).toBeDefined();
    expect(getByLabelText("Adicionar foto da capa")).toBeDefined();
  });

  it("aceita um rótulo customizado", async () => {
    const { getByText, getByLabelText } = await render(
      <AddPhotoCard label="Foto do verso" onPress={() => {}} />,
    );
    expect(getByText("Foto do verso")).toBeDefined();
    expect(getByLabelText("Adicionar foto do verso")).toBeDefined();
  });

  it("chama onPress ao tocar", async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(<AddPhotoCard onPress={onPress} />);
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("exibe pré-visualização quando photoUrl é informado e permite remoção", async () => {
    const onRemove = vi.fn();
    const { getByLabelText } = await render(
      <AddPhotoCard
        onPress={() => {}}
        photoUrl="https://imagens.ipebook.app/capa.jpg"
        onRemovePhoto={onRemove}
      />,
    );
    expect(getByLabelText("Pré-visualização da foto da capa")).toBeDefined();
    fireEvent.press(getByLabelText("Remover foto da capa"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
