import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react-native";
import { Chip } from "@/view/components/Chip";

describe("Chip (design-system/04-componentes/chip.md)", () => {
  it("anuncia o estado de seleção via accessibilityState, não só pela cor", async () => {
    const { getByRole } = await render(<Chip label="Venda" selected onPress={() => {}} />);
    expect(getByRole("checkbox").props.accessibilityState.checked).toBe(true);
  });

  it("mostra o rótulo sem o caractere de check quando selecionado (o check é um ícone)", async () => {
    const { getByText } = await render(<Chip label="Venda" selected onPress={() => {}} />);
    expect(getByText("Venda")).toBeDefined();
  });

  it("mostra o rótulo quando não selecionado", async () => {
    const { getByText } = await render(<Chip label="Venda" selected={false} onPress={() => {}} />);
    expect(getByText("Venda")).toBeDefined();
  });

  it("chama onPress ao tocar", async () => {
    const onPress = vi.fn();
    const { getByRole } = await render(<Chip label="Venda" selected={false} onPress={onPress} />);
    fireEvent.press(getByRole("checkbox"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("não responde quando desabilitado", async () => {
    const { getByRole } = await render(
      <Chip label="Venda" selected={false} onPress={() => {}} disabled />,
    );
    expect(getByRole("checkbox").props.accessibilityState.disabled).toBe(true);
  });
});
