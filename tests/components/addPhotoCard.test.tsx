import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react-native";
import { AddPhotoCard } from "@/view/components/AddPhotoCard";

describe("AddPhotoCard (design-system/04-componentes/cartao-de-adicionar-foto.md)", () => {
  it("usa o rótulo visível como rótulo acessível", async () => {
    const { getByLabelText } = await render(<AddPhotoCard onPress={() => {}} />);
    expect(getByLabelText("Adicionar foto")).toBeDefined();
  });

  it("aceita um rótulo customizado", async () => {
    const { getByLabelText } = await render(<AddPhotoCard label="Trocar foto" onPress={() => {}} />);
    expect(getByLabelText("Trocar foto")).toBeDefined();
  });

  it("chama onPress ao tocar", async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(<AddPhotoCard onPress={onPress} />);
    fireEvent.press(getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
