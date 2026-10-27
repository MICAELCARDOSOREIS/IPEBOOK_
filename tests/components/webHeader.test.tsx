import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebHeader } from "@/view/components/WebHeader";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

afterEach(async () => {
  await cleanup();
});

async function wrap(node: React.ReactElement) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<ThemeProvider>{node}</ThemeProvider>);
  });
  return screen;
}

describe("WebHeader (Figma 34:70)", () => {
  it("navega pelos atalhos, abre Anunciar e mostra iniciais e selo de propostas", async () => {
    const onNavigate = vi.fn();
    const onAnnounce = vi.fn();
    const screen = await wrap(
      <WebHeader active="search" onNavigate={onNavigate} onAnnounce={onAnnounce} initials="LA" badgeCount={2} />,
    );

    expect(screen.getByText("LA")).toBeDefined();
    expect(screen.getByLabelText("Conversas, 2 com proposta")).toBeDefined();

    fireEvent.press(screen.getByLabelText("Anunciar um livro"));
    expect(onAnnounce).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByLabelText("Meu perfil"));
    expect(onNavigate).toHaveBeenCalledWith("profile");
    fireEvent.press(screen.getByLabelText("Buscar título, autor ou categoria"));
    expect(onNavigate).toHaveBeenCalledWith("search");
  });
});
