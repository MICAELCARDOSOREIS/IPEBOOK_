import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { NavigationBar } from "@/view/components/NavigationBar";

describe("NavigationBar (design-system/04-componentes/barra-de-navegacao.md, ADR 0011)", () => {
  it("mostra exatamente os 3 destinos do ADR 0011", async () => {
    const { getByLabelText } = await render(<NavigationBar active="home" onNavigate={() => {}} />);
    expect(getByLabelText("Início")).toBeDefined();
    expect(getByLabelText("Pesquisa")).toBeDefined();
    expect(getByLabelText("Perfil")).toBeDefined();
  });

  it("anuncia o destino atual como selecionado e os demais como não selecionados", async () => {
    const { getByLabelText } = await render(<NavigationBar active="search" onNavigate={() => {}} />);
    expect(getByLabelText("Pesquisa").props.accessibilityState).toEqual({ selected: true });
    expect(getByLabelText("Início").props.accessibilityState).toEqual({ selected: false });
    expect(getByLabelText("Perfil").props.accessibilityState).toEqual({ selected: false });
  });

  it("chama onNavigate com o destino tocado", async () => {
    const onNavigate = vi.fn();
    const { getByLabelText } = await render(<NavigationBar active="home" onNavigate={onNavigate} />);
    fireEvent.press(getByLabelText("Perfil"));
    expect(onNavigate).toHaveBeenCalledWith("profile");
  });
});
