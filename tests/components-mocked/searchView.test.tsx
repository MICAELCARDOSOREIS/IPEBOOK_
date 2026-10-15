import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import Search from "@/view/search/search";

vi.mock("@/viewmodel/useSearchViewModel", () => ({ useSearchViewModel: vi.fn() }));

import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "other",
  modality: "trade",
  status: "available",
  ...over,
});

function setup(books: Book[], term = "", options: { loading?: boolean; error?: string | null } = {}) {
  const setTerm = vi.fn();
  vi.mocked(useSearchViewModel).mockReturnValue([
    { term, books, loading: options.loading ?? false, error: options.error ?? null },
    { setTerm, reload: vi.fn() },
  ]);
  return { setTerm };
}

async function renderSearch(props: React.ComponentProps<typeof Search> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => { screen = await render(<Search {...props} />); });
  return screen;
}

describe("Search (spec 006, US3/T019)", () => {
  it("mostra os livros filtrados retornados pelo ViewModel", async () => {
    setup([book({})]);
    const screen = await renderSearch();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
  });

  it("digitar no campo de busca chama setTerm (SC-002)", async () => {
    const { setTerm } = setup([book({})]);
    const screen = await renderSearch();
    fireEvent.changeText(screen.getByLabelText("Buscar livros"), "dom");
    expect(setTerm).toHaveBeenCalledWith("dom");
  });

  it("mostra estado vazio explicando a ausência de resultado, não um erro (SC-002)", async () => {
    setup([], "termo-sem-correspondencia");
    const screen = await renderSearch();
    expect(screen.getByText("Nenhum livro encontrado.")).toBeDefined();
    expect(screen.getByText("Tente buscar por outro título ou autor.")).toBeDefined();
  });

  it("navega para o detalhe do livro ao tocar num resultado", async () => {
    setup([book({ id: "x" })]);
    const onNavigateToBookDetail = vi.fn();
    const screen = await renderSearch({ onNavigateToBookDetail });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver detalhe de Dom Casmurro, Machado de Assis"));
    });
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("x");
  });

  it("mostra erro de domínio em vez da lista quando o carregamento falha", async () => {
    setup([], "", { error: "Não foi possível carregar os livros. Tente novamente." });
    const screen = await renderSearch();
    expect(screen.getByRole("alert").props.children).toBe("Não foi possível carregar os livros. Tente novamente.");
  });
});
