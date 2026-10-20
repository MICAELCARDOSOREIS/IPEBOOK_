import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import Search from "@/view/search/search";

vi.mock("@/viewmodel/useSearchViewModel", () => ({ useSearchViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import {
  type SearchModalityFilter,
  type SearchSortOption,
  useSearchViewModel,
} from "@/viewmodel/useSearchViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "other",
  modality: "trade",
  status: "available",
  ...over,
});

function setup(
  books: Book[],
  term = "",
  options: {
    loading?: boolean;
    error?: string | null;
    history?: string[];
    modality?: SearchModalityFilter;
    sortBy?: SearchSortOption;
  } = {},
) {
  const setTerm = vi.fn();
  const setModality = vi.fn();
  const setSortBy = vi.fn();
  const registerSearch = vi.fn();
  const clearHistory = vi.fn();
  vi.mocked(useSearchViewModel).mockReturnValue([
    {
      term,
      books,
      loading: options.loading ?? false,
      error: options.error ?? null,
      history: options.history ?? [],
      modality: options.modality ?? "all",
      sortBy: options.sortBy ?? "recent",
    },
    { setTerm, setModality, setSortBy, reload: vi.fn(), registerSearch, clearHistory },
  ]);
  return { setTerm, setModality, setSortBy, registerSearch, clearHistory };
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

  it("navega para o detalhe do livro ao tocar num resultado e registra a busca no histórico", async () => {
    const { registerSearch } = setup([book({ id: "x" })], "dom cas");
    const onNavigateToBookDetail = vi.fn();
    const screen = await renderSearch({ onNavigateToBookDetail });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver detalhe de Dom Casmurro, Machado de Assis"));
    });
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("x");
    expect(registerSearch).toHaveBeenCalledWith("dom cas");
  });

  it("mostra erro de domínio em vez da lista quando o carregamento falha", async () => {
    setup([], "", { error: "Não foi possível carregar os livros. Tente novamente." });
    const screen = await renderSearch();
    expect(screen.getByRole("alert").props.children).toBe("Não foi possível carregar os livros. Tente novamente.");
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline (Issue #76)", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    setup([], "", { error: "Não foi possível carregar os livros." });
    const screen = await renderSearch();
    expect(screen.getByRole("alert").props.children).toBe("Você está sem conexão com a internet.");
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });

  it("mostra buscas recentes quando o campo está vazio e toque refaz a busca (issue #94)", async () => {
    const { setTerm } = setup([book({})], "", { history: ["Iracema", "Casmurro"] });
    const screen = await renderSearch();
    expect(screen.getByText("Buscas recentes")).toBeDefined();
    fireEvent.press(screen.getByLabelText("Buscar novamente por Iracema"));
    expect(setTerm).toHaveBeenCalledWith("Iracema");
  });

  it("não mostra buscas recentes quando há termo digitado", async () => {
    setup([book({})], "dom", { history: ["Iracema"] });
    const screen = await renderSearch();
    expect(screen.queryByText("Buscas recentes")).toBeNull();
  });

  it("pede confirmação antes de limpar o histórico de buscas", async () => {
    const { clearHistory } = setup([book({})], "", { history: ["Iracema"] });
    const screen = await renderSearch();
    await act(async () => { fireEvent.press(screen.getByLabelText("Limpar histórico de buscas")); });
    expect(screen.getByText("Limpar histórico de buscas?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Limpar histórico" })); });
    expect(clearHistory).toHaveBeenCalledOnce();
  });

  it("permite filtrar livros por modalidade acionando os Chips (Issue #93)", async () => {
    const { setModality } = setup([book({})], "", { modality: "all" });
    const screen = await renderSearch();
    expect(screen.getByText("Modalidade:")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Venda"));
    });
    expect(setModality).toHaveBeenCalledWith("sale");

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Troca"));
    });
    expect(setModality).toHaveBeenCalledWith("trade");
  });
});
