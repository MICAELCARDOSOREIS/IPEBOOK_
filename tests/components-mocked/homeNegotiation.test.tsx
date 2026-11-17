import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import Home from "@/view/home";

jest.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));

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
  jest.mocked(useHomeViewModel).mockReturnValue([{ books, loading: false, error: null }, { reload: jest.fn() }]);
  jest.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() },
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
    const onNavigateToBookDetail = jest.fn();
    const screen = await renderHome({ onNavigateToBookDetail });
    await act(async () => {
      fireEvent.press(screen.getAllByLabelText("Ver detalhe de De outra, Autora")[0]);
    });
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("a");
  });

  it("indica anúncio reservado na própria linha, sem ação de negociar embutida", async () => {
    setup([book({ id: "c", title: "Livro Reservado", status: "reserved" })], user);
    const screen = await renderHome();
    expect(screen.getByText("Reservado", { exact: true })).toBeDefined();
    expect(screen.queryByText("Solicitar negociação")).toBeNull();
  });

  it("não mostra pedidos recebidos/meus pedidos sem sessão", async () => {
    setup([book({})], null);
    const screen = await renderHome();
    expect(screen.queryByText("Pedidos recebidos")).toBeNull();
    expect(screen.queryByText("Meus pedidos")).toBeNull();
  });
});
