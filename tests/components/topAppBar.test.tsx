import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { TopAppBar } from "@/view/components/TopAppBar";

describe("TopAppBar (design-system/04-componentes/barra-superior.md)", () => {
  it("mostra o nome da tela como cabeçalho acessível", async () => {
    const { getByRole } = await render(<TopAppBar title="Detalhe" onBack={() => {}} />);
    const header = getByRole("header");
    expect(header.props.children).toBe("Detalhe");
  });

  it("aciona onBack ao tocar no botão voltar", async () => {
    const onBack = vi.fn();
    const { getByLabelText } = await render(<TopAppBar title="Detalhe" onBack={onBack} />);
    fireEvent.press(getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
