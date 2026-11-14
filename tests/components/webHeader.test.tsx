import type React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebHeader } from "@/view/components/WebHeader";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

afterEach(async () => {
  await cleanup();
});

async function wrap(node: React.ReactElement) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
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
    // Na tela de Pesquisa, evita duplicar o campo de busca já presente no corpo da página.
    expect(screen.queryByLabelText("Buscar título, autor ou categoria")).toBeNull();

    await fireEvent.press(screen.getByLabelText("Anunciar um livro"));
    expect(onAnnounce).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByLabelText("Meu perfil"));
    expect(onNavigate).toHaveBeenCalledWith("profile");
  });

  it("busca pelo termo digitado e, vazio, apenas abre a Pesquisa", async () => {
    const onNavigate = vi.fn();
    const onSearch = vi.fn();
    const screen = await wrap(<WebHeader onNavigate={onNavigate} onAnnounce={vi.fn()} onSearch={onSearch} />);

    await fireEvent(screen.getByLabelText("Buscar título, autor ou categoria"), "submitEditing");
    expect(onSearch).not.toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith("search");

    await fireEvent.changeText(screen.getByLabelText("Buscar título, autor ou categoria"), "  Dom Casmurro ");
    await fireEvent(screen.getByLabelText("Buscar título, autor ou categoria"), "submitEditing");
    expect(onSearch).toHaveBeenCalledWith("Dom Casmurro");
  });
});
