import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import Search from "@/view/search/search";

vi.mock("@/viewmodel/useSearchViewModel", () => ({ useSearchViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));

import {
  type SearchModalityFilter,
  type SearchPriceRange,
  type SearchSortOption,
  useSearchViewModel,
} from "@/viewmodel/useSearchViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

const book = (over: Partial<Book>): Book => ({
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  category: "Literatura Brasileira",
  ownerId: "other",
  modality: "trade",
  price: 25,
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
    category?: string | "all";
    priceRange?: SearchPriceRange;
    sortBy?: SearchSortOption;
    availableCategories?: string[];
    hasActiveFilters?: boolean;
  } = {},
) {
  const setTerm = vi.fn();
  const setModality = vi.fn();
  const setCategory = vi.fn();
  const setPriceRange = vi.fn();
  const setSortBy = vi.fn();
  const clearFilters = vi.fn();
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
      category: options.category ?? "all",
      priceRange: options.priceRange ?? "all",
      sortBy: options.sortBy ?? "recent",
      availableCategories: options.availableCategories ?? ["Literatura Brasileira", "Didáticos"],
      hasActiveFilters: options.hasActiveFilters ?? false,
    },
    {
      setTerm,
      setModality,
      setCategory,
      setPriceRange,
      setSortBy,
      clearFilters,
      reload: vi.fn(),
      registerSearch,
      clearHistory,
    },
  ]);
  return {
    setTerm,
    setModality,
    setCategory,
    setPriceRange,
    setSortBy,
    clearFilters,
    registerSearch,
    clearHistory,
  };
}

async function renderSearch(props: React.ComponentProps<typeof Search> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => { screen = await render(<Search {...props} />); });
  return screen;
}

describe("Search (spec 006, US3/T019, Spec 028, Issue #93)", () => {
  it("mostra os livros filtrados retornados pelo ViewModel com categoria e preço", async () => {
    setup([book({})]);
    const screen = await renderSearch();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.getAllByText("Literatura Brasileira").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("R$ 25,00")).toBeDefined();
  });

  it("pré-aplica a modalidade recebida via initialModality ao abrir (Issue #146)", async () => {
    const { setModality } = setup([book({})]);
    await renderSearch({ initialModality: "donation" });
    expect(setModality).toHaveBeenCalledWith("donation");
    expect(setModality).toHaveBeenCalledTimes(1);
  });

  it("não chama setModality quando initialModality não é informado", async () => {
    const { setModality } = setup([book({})]);
    await renderSearch();
    expect(setModality).not.toHaveBeenCalled();
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
    expect(screen.getByText("Ainda não há livros no catálogo.")).toBeDefined();
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
    await act(async () => { fireEvent.press(screen.getByLabelText("Mostrar filtros avançados")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Limpar histórico de buscas")); });
    expect(screen.getByText("Limpar histórico de buscas?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Limpar histórico" })); });
    expect(clearHistory).toHaveBeenCalledOnce();
  });

  it("permite filtrar livros por modalidade acionando os Chips (Issue #93)", async () => {
    const { setModality } = setup([book({})], "", { modality: "all" });
    const screen = await renderSearch();
    await act(async () => { fireEvent.press(screen.getByLabelText("Mostrar filtros avançados")); });
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

  it("permite filtrar livros por categoria e preço (Spec 028, Issue #93)", async () => {
    const { setCategory, setPriceRange, setSortBy } = setup([book({})], "", {
      availableCategories: ["Literatura Brasileira", "Didáticos"],
    });
    const screen = await renderSearch();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mostrar filtros avançados"));
    });
    expect(screen.getByText("Categoria:")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por categoria Literatura Brasileira"));
    });
    expect(setCategory).toHaveBeenCalledWith("Literatura Brasileira");

    expect(screen.getByText("Preço:")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Até R$ 20"));
    });
    expect(setPriceRange).toHaveBeenCalledWith("under20");

    expect(screen.getByText("Ordenar por:")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ordenar por Menor preço"));
    });
    expect(setSortBy).toHaveBeenCalledWith("price_asc");
  });

  it("permite limpar filtros no cabeçalho ou no estado vazio quando houver filtros ativos", async () => {
    const { clearFilters } = setup([], "termo", { hasActiveFilters: true });
    const screen = await renderSearch();

    expect(screen.getByText("Nenhum livro corresponde aos filtros selecionados.")).toBeDefined();

    const clearButton = screen.getByLabelText("Limpar todos os filtros de busca");
    await act(async () => {
      fireEvent.press(clearButton);
    });
    expect(clearFilters).toHaveBeenCalledTimes(1);
  });
});
