import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import Home from "@/view/home";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Livro",
  author: "Autora",
  ownerId: "other",
  modality: "trade",
  status: "available",
  ...over,
});

function setup(books: Book[], user: AuthState["user"]) {
  vi.mocked(useHomeViewModel).mockReturnValue([{ books, loading: false, error: null }, { reload: vi.fn() }]);
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
  ]);
}

async function renderHome(props: React.ComponentProps<typeof Home> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => { screen = await render(<Home {...props} />); });
  return screen;
}

describe("navegação para o detalhe do livro a partir da Home (spec 006, US6/T030)", () => {
  const user = { id: "me", email: "eu@exemplo.com" };

  it("cada linha do catálogo navega para o detalhe do livro ao ser tocada", async () => {
    setup([book({ id: "a", title: "De outra" })], user);
    const onNavigateToBookDetail = vi.fn();
    const screen = await renderHome({ onNavigateToBookDetail });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver detalhe de De outra, Autora"));
    });
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("a");
  });

  it("indica anúncio reservado na própria linha, sem ação de negociar embutida", async () => {
    setup([book({ id: "c", title: "Livro Reservado", status: "reserved" })], user);
    const screen = await renderHome();
    expect(screen.getByText("Reservado", { exact: true })).toBeDefined();
    expect(screen.queryByText("Solicitar negociação")).toBeNull();
  });

  it("navega para pedidos recebidos e meus pedidos", async () => {
    setup([], user);
    const onNavigateToReceivedRequests = vi.fn();
    const onNavigateToSentRequests = vi.fn();
    const screen = await renderHome({ onNavigateToReceivedRequests, onNavigateToSentRequests });
    await act(async () => { fireEvent.press(screen.getByText("Pedidos recebidos")); });
    await act(async () => { fireEvent.press(screen.getByText("Meus pedidos")); });
    expect(onNavigateToReceivedRequests).toHaveBeenCalledTimes(1);
    expect(onNavigateToSentRequests).toHaveBeenCalledTimes(1);
  });

  it("não mostra pedidos recebidos/meus pedidos sem sessão", async () => {
    setup([book({})], null);
    const screen = await renderHome();
    expect(screen.queryByText("Pedidos recebidos")).toBeNull();
    expect(screen.queryByText("Meus pedidos")).toBeNull();
  });
});
