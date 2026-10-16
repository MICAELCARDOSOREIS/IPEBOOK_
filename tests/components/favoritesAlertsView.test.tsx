import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Favorites from "@/view/favorites/favorites";
import SearchAlerts from "@/view/search/searchAlerts";

describe("favoritos e alertas (spec 016)", () => {
  it("orienta a entrar sem perder a tela de favoritos", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId={null} onBack={vi.fn()} onLogin={onLogin} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Entre para ver seus favoritos" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it("mostra lista vazia de favoritos para conta sem livros salvos", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId="usuario-favoritos-vazio" onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Nenhum favorito ainda" })).toBeDefined();
  });

  it("cria, pausa, retoma e exclui um alerta com confirmação", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alertas" initialQuery="Machado" onBack={vi.fn()} onLogin={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Você ainda não criou alertas." })).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    expect(screen.getByText("Machado")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Pausar alerta Machado" })); });
    expect(screen.getByText("Pausado")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Retomar alerta Machado" })); });
    expect(screen.getByText("Ativo")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Excluir alerta Machado" })); });
    expect(screen.getByText("Excluir este alerta?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Confirmar exclusão" })); });
    expect(screen.getByRole("header", { name: "Você ainda não criou alertas." })).toBeDefined();
  });

  it("orienta a entrar para criar um alerta", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId={null} onBack={vi.fn()} onLogin={onLogin} />); });
    expect(screen.getByRole("header", { name: "Entre para criar alertas" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(onLogin).toHaveBeenCalledOnce();
  });
});
