import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Favorites from "@/view/favorites/favorites";
import SearchAlerts from "@/view/search/searchAlerts";
import { bookUseCases, favoriteUseCases } from "@/di/container";

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

  it("atualiza favoritos ao retornar do detalhe após desfavoritar", async () => {
    const userId = "usuario-retorno-favoritos";
    const book = await bookUseCases.createListing({ title: "Livro de retorno", author: "Autora", modality: "donation" }, userId);
    await favoriteUseCases.toggleFavorite(userId, book.id);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Favorites userId={userId} focusKey={0} onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByText("Livro de retorno")).toBeDefined();

    await favoriteUseCases.toggleFavorite(userId, book.id);
    await act(async () => { screen.rerender(<Favorites userId={userId} focusKey={1} onBack={vi.fn()} onLogin={vi.fn()} onBook={vi.fn()} />); });
    expect(screen.getByRole("header", { name: "Nenhum favorito ainda" })).toBeDefined();
  });

  it("abre o gerenciamento pelo alvo único da lista", async () => {
    const onManageAlert = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alertas" initialQuery="Machado" onBack={vi.fn()} onLogin={vi.fn()} onManageAlert={onManageAlert} />); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    const row = screen.getByRole("button", { name: "Gerenciar alerta Machado" });
    expect(screen.getByText("Venda, troca e doação · Piripiri, PI")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Editar alerta Machado" })).toBeNull();
    fireEvent.press(row);
    expect(onManageAlert).toHaveBeenCalledWith(expect.stringMatching(/^alert-/));
  });

  it("associa o erro de validação do alerta ao campo para leitores de tela", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId="usuario-alerta-invalido" onBack={vi.fn()} onLogin={vi.fn()} />); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Termo do alerta"), "a"); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    const input = screen.getByLabelText("Termo do alerta");
    const errorText = screen.getByRole("alert");
    expect(input.props["aria-describedby"]).toBeDefined();
    expect(input.props["aria-describedby"]).toBe(errorText.props.nativeID);
    expect(input.props.accessibilityHint).toBe(errorText.props.children);

    await act(async () => { fireEvent.changeText(screen.getByLabelText("Termo do alerta"), "Machado"); });
    expect(screen.getByLabelText("Termo do alerta").props["aria-describedby"]).toBeUndefined();
  });

  it("orienta a entrar para criar um alerta", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<SearchAlerts userId={null} onBack={vi.fn()} onLogin={onLogin} />); });
    expect(screen.getByRole("header", { name: "Entre para criar alertas" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it("oferece busca por outro livro após criar alerta", async () => {
    const onSearchBooks = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<SearchAlerts userId="usuario-cartao-alerta" initialQuery="Clarice" onBack={vi.fn()} onLogin={vi.fn()} onSearchBooks={onSearchBooks} />);
    });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Criar alerta" })); });
    expect(screen.getByRole("button", { name: "Gerenciar alerta Clarice" })).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Procurar outro livro" }));
    expect(onSearchBooks).toHaveBeenCalledTimes(1);
  });

});
