import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { SearchField } from "@/view/components/SearchField";

describe("SearchField (design-system/04-componentes/campo-de-busca.md)", () => {
  it("tem rótulo acessível fixo independente do placeholder visível", async () => {
    const { getByLabelText } = await render(<SearchField value="" onChangeText={() => {}} />);
    expect(getByLabelText("Buscar livros")).toBeDefined();
  });

  it("chama onChangeText ao digitar", async () => {
    const onChangeText = vi.fn();
    const { getByLabelText } = await render(<SearchField value="" onChangeText={onChangeText} />);
    fireEvent.changeText(getByLabelText("Buscar livros"), "Dom Casmurro");
    expect(onChangeText).toHaveBeenCalledWith("Dom Casmurro");
  });

  it("não mostra botão Limpar quando o campo está vazio", async () => {
    const { queryByLabelText } = await render(<SearchField value="" onChangeText={() => {}} />);
    expect(queryByLabelText("Limpar busca")).toBeNull();
  });

  it("mostra botão Limpar com texto e limpa o campo ao tocar", async () => {
    const onChangeText = vi.fn();
    const { getByLabelText } = await render(<SearchField value="Dom Casmurro" onChangeText={onChangeText} />);
    fireEvent.press(getByLabelText("Limpar busca"));
    expect(onChangeText).toHaveBeenCalledWith("");
  });
});
