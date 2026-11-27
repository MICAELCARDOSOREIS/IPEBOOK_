import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import Search, { getNeighborhoodPreposition, parseInitialModality } from "@/view/search/search";

jest.mock("@/viewmodel/useSearchViewModel", () => ({ useSearchViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: jest.fn() }));
jest.mock("@/viewmodel/usePersistedSearchFilters", () => ({
  usePersistedSearchFilters: jest.fn(() => ({
    persisted: null,
    loaded: true,
    persist: jest.fn(),
  })),
}));

import {
  type SearchConditionFilter,
  type SearchModalityFilter,
  type SearchPriceRange,
  type SearchSortOption,
  useSearchViewModel,
} from "@/viewmodel/useSearchViewModel";
import { describeResults, activeFilters as deriveActiveFilters, type SearchFilters } from "@/viewmodel/searchFilters";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

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
    condition?: SearchConditionFilter;
    priceRange?: SearchPriceRange;
    sortBy?: SearchSortOption;
    availableCategories?: string[];
    hasActiveFilters?: boolean;
    draftResultCount?: number;
    matchesInOtherNeighborhoods?: number;
  } = {},
) {
  const setTerm = jest.fn();
  const setModality = jest.fn();
  const setCategory = jest.fn();
  const setCondition = jest.fn();
  const setNeighborhood = jest.fn();
  const setPriceRange = jest.fn();
  const setSortBy = jest.fn();
  const removeActiveFilter = jest.fn();
  const openFilterDraft = jest.fn();
  const updateDraftFilters = jest.fn();
  const applyDraftFilters = jest.fn();
  const resetFilters = jest.fn();
  const clearFilters = jest.fn();
  const reload = jest.fn();
  const registerSearch = jest.fn();
  const clearHistory = jest.fn();

  const filters: SearchFilters = {
    modality: options.modality ?? "all",
    category: options.category ?? "all",
    condition: options.condition ?? "all",
    priceRange: options.priceRange ?? "all",
    onlyBoxes: false,
  };
  const activeFilters = deriveActiveFilters(filters);

  jest.mocked(useSearchViewModel).mockReturnValue([
    {
      term,
      filters,
      draftFilters: filters,
      books,
      loading: options.loading ?? false,
      error: options.error ?? null,
      history: options.history ?? [],
      modality: filters.modality,
      category: filters.category,
      condition: filters.condition,
      onlyBoxes: false,
      neighborhood: "all",
      priceRange: filters.priceRange,
      sortBy: options.sortBy ?? "recent",
      availableCategories: options.availableCategories ?? ["Literatura Brasileira", "Didáticos"],
      activeFilters,
      activeFilterCount: activeFilters.length,
      hasActiveFilters: options.hasActiveFilters ?? (Boolean(term.trim()) || activeFilters.length > 0),
      resultsSummary: describeResults(books.length, filters),
      draftResultCount: options.draftResultCount ?? books.length,
      matchesInOtherNeighborhoods: options.matchesInOtherNeighborhoods ?? 0,
    },
    {
      setTerm,
      setModality,
      setCategory,
      setCondition,
      setOnlyBoxes: jest.fn(),
      setNeighborhood,
      setPriceRange,
      setSortBy,
      removeActiveFilter,
      openFilterDraft,
      updateDraftFilters,
      applyDraftFilters,
      resetFilters,
      clearFilters,
      reload,
      registerSearch,
      clearHistory,
    },
  ]);
  return {
    setTerm,
    setModality,
    setCategory,
    setCondition,
    setNeighborhood,
    setPriceRange,
    setSortBy,
    removeActiveFilter,
    openFilterDraft,
    reload,
    updateDraftFilters,
    applyDraftFilters,
    resetFilters,
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
    expect(
      screen.getByText('Nenhum livro encontrado para "termo-sem-correspondencia". Tente outro título, autor ou categoria.'),
    ).toBeDefined();
  });

  it("avisa quando só o bairro escolhido esconde livros que existem em outros (Spec 091)", async () => {
    setup([], "", { modality: "trade", matchesInOtherNeighborhoods: 3 });
    const screen = await renderSearch({ currentNeighborhood: "Centro" });
    expect(screen.getByText("Nenhum livro no Centro com essa busca.")).toBeDefined();
    expect(screen.getByText("Há 3 livros em outros bairros de Piripiri.")).toBeDefined();
    expect(screen.getByLabelText("Ver em toda Piripiri")).toBeDefined();
    expect(screen.getByLabelText("Limpar filtros e buscar novamente")).toBeDefined();
  });

  it("não exibe 'Limpar filtros' duplicado quando apenas o local restringe a busca", async () => {
    setup([], "", { matchesInOtherNeighborhoods: 5 });
    const screen = await renderSearch({ currentNeighborhood: "Campus IFPI Piripiri" });
    expect(screen.getByText("Nenhum livro no Campus IFPI Piripiri com essa busca.")).toBeDefined();
    expect(screen.getByLabelText("Ver em toda Piripiri")).toBeDefined();
    expect(screen.queryByLabelText("Limpar filtros e buscar novamente")).toBeNull();
  });

  it("usa a preposição correta 'na' para locais femininos como Praça da Bandeira", async () => {
    setup([], "", { matchesInOtherNeighborhoods: 2 });
    const screen = await renderSearch({ currentNeighborhood: "Praça da Bandeira" });
    expect(screen.getByText("Nenhum livro na Praça da Bandeira com essa busca.")).toBeDefined();
  });

  it("não sugere outros bairros quando nenhum livro existe fora do bairro (Spec 091)", async () => {
    setup([], "", { matchesInOtherNeighborhoods: 0 });
    const screen = await renderSearch({ currentNeighborhood: "Centro" });
    expect(screen.queryByLabelText("Ver em toda Piripiri")).toBeNull();
  });

  it("explica o catálogo vazio quando não há termo nem filtros", async () => {
    setup([]);
    const screen = await renderSearch();
    expect(screen.getByText("Ainda não há livros no catálogo.")).toBeDefined();
  });

  it("navega para o detalhe do livro ao tocar num resultado e registra a busca no histórico", async () => {
    const { registerSearch } = setup([book({ id: "x" })], "dom cas");
    const onNavigateToBookDetail = jest.fn();
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
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    setup([], "", { error: "Não foi possível carregar os livros." });
    const screen = await renderSearch();
    expect(screen.getByRole("alert").props.children).toBe("Você está sem conexão com a internet.");
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
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
    expect(clearHistory).toHaveBeenCalledTimes(1);
  });

  it("abre 'Filtrar livros' com rascunho e só aplica ao tocar em Mostrar N livros (Figma 02.03)", async () => {
    const { openFilterDraft, updateDraftFilters, applyDraftFilters, resetFilters } = setup(
      [book({}), book({ id: "b2", title: "Capitães da Areia" })],
      "",
      { draftResultCount: 1 },
    );
    const screen = await renderSearch();

    await act(async () => { fireEvent.press(screen.getByLabelText("Abrir filtros")); });
    expect(openFilterDraft).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Filtrar livros")).toBeDefined();
    expect(screen.getByText("Uma leitura do seu jeito.")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByLabelText("Filtrar por Venda")); });
    expect(updateDraftFilters).toHaveBeenCalledWith({ modality: "sale" });
    await act(async () => { fireEvent.press(screen.getByLabelText("Filtrar por Troca")); });
    expect(updateDraftFilters).toHaveBeenCalledWith({ modality: "trade" });
    expect(applyDraftFilters).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(screen.getByLabelText("Mostrar 1 livro")); });
    expect(applyDraftFilters).toHaveBeenCalledTimes(1);

    await act(async () => { fireEvent.press(screen.getByLabelText("Abrir filtros")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Limpar filtros")); });
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });

  it("filtra por categoria, modalidade, conservação, preço e ordenação na tela de filtros (Spec 028)", async () => {
    const { updateDraftFilters, setSortBy } = setup([book({})], "", {
      availableCategories: ["Literatura Brasileira", "Didáticos"],
    });
    const screen = await renderSearch();
    await act(async () => { fireEvent.press(screen.getByLabelText("Abrir filtros")); });

    expect(screen.getByText("Categoria")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por categoria Literatura Brasileira"));
    });
    expect(updateDraftFilters).toHaveBeenCalledWith({ category: "Literatura Brasileira" });

    expect(screen.getByText("Condição do livro")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Bom estado")); });
    expect(updateDraftFilters).toHaveBeenCalledWith({ condition: "good" });

    await act(async () => { fireEvent.press(screen.getByLabelText("Com marcas")); });
    expect(updateDraftFilters).toHaveBeenCalledWith({ condition: "marked" });

    expect(screen.getByText("Preço")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Filtrar por Até R$ 20")); });
    expect(updateDraftFilters).toHaveBeenCalledWith({ priceRange: "under20" });

    expect(screen.getByText("Ordenar por")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Ordenar por Menor preço")); });
    expect(setSortBy).toHaveBeenCalledWith("price_asc");
  });

  it("mostra os filtros aplicados como chips removíveis sem duplicar modalidade no mobile (Figma 02.04)", async () => {
    const { removeActiveFilter } = setup([book({})], "", { modality: "sale", condition: "good", priceRange: "under50" });
    const screen = await renderSearch();

    expect(screen.queryByLabelText("Remover filtro Venda")).toBeNull();
    expect(screen.getByLabelText("Remover filtro Bom estado")).toBeDefined();
    expect(screen.getByLabelText("Remover filtro Até R$ 50")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByLabelText("Remover filtro Bom estado")); });
    expect(removeActiveFilter).toHaveBeenCalledWith("condition");
  });

  it("resume a faixa de resultados e troca a ordenação pela folha de ordenação (Figma 02.04)", async () => {
    const { setSortBy } = setup(
      [book({}), book({ id: "b2", title: "Capitães da Areia", author: "Jorge Amado" })],
      "",
      { modality: "sale" },
    );
    const screen = await renderSearch();

    expect(screen.getByText("2 livros à venda")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Ordenar por Mais recentes")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("A-Z")); });
    expect(setSortBy).toHaveBeenCalledWith("title");
  });

  it("limpa os filtros no cabeçalho sem apagar o termo buscado", async () => {
    const { resetFilters } = setup([book({})], "termo", { modality: "sale" });
    const screen = await renderSearch();

    expect(screen.getByLabelText("Abrir filtros, 1 ativos")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar todos os filtros de busca"));
    });
    expect(resetFilters).toHaveBeenCalledTimes(1);
  });

  it("oferece limpar filtros no estado vazio quando nada corresponde", async () => {
    const { clearFilters } = setup([], "termo", { hasActiveFilters: true, modality: "sale" });
    const screen = await renderSearch();

    expect(screen.getByText("Nenhum livro corresponde aos filtros selecionados.")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar filtros e buscar novamente"));
    });
    expect(clearFilters).toHaveBeenCalledTimes(1);
  });

  it("renderiza o selo de local no card do livro na busca quando definido (Spec 070 / ADR 0053)", async () => {
    setup([book({ neighborhood: "Praça da Bandeira" })]);
    const screen = await renderSearch();

    expect(screen.getByText("Praça da Bandeira")).toBeDefined();
    expect(screen.getByLabelText("Ver detalhe de Dom Casmurro, Machado de Assis em Praça da Bandeira")).toBeDefined();
  });

  it("aciona o atalho para a tela de favoritos ao tocar no botão da barra superior", async () => {
    setup([book({})]);
    const onNavigateToFavorites = jest.fn();
    const screen = await renderSearch({ onNavigateToFavorites });

    const favButton = screen.getByLabelText("Ver meus livros favoritos");
    expect(favButton).toBeDefined();
    await act(async () => {
      fireEvent.press(favButton);
    });
    expect(onNavigateToFavorites).toHaveBeenCalledTimes(1);
  });

  it("exibe o botão de voltar ao topo após rolagem e aciona retorno", async () => {
    setup([book({})]);
    const screen = await renderSearch();

    expect(screen.queryByLabelText("Voltar ao topo da lista")).toBeNull();

    const flatList = screen.getByTestId("search-flatlist");
    await act(async () => {
      fireEvent.scroll(flatList, { nativeEvent: { contentOffset: { y: 350 } } });
    });

    const scrollTopBtn = screen.getByLabelText("Voltar ao topo da lista");
    expect(scrollTopBtn).toBeDefined();

    await act(async () => {
      fireEvent(scrollTopBtn, "hoverIn");
      fireEvent(scrollTopBtn, "hoverOut");
      fireEvent.press(scrollTopBtn);
    });
  });

  it("converte modalidade inicial e preposição de bairros e interage com chips, histórico, bairro e erro", async () => {
    expect(parseInitialModality("sale")).toBe("sale");
    expect(parseInitialModality(["trade"])).toBe("trade");
    expect(parseInitialModality("invalida")).toBeUndefined();
    expect(parseInitialModality(undefined)).toBeUndefined();
    expect(getNeighborhoodPreposition("Praça da Bandeira")).toBe("na");
    expect(getNeighborhoodPreposition("Centro")).toBe("no");

    const { setModality, registerSearch, clearHistory, reload } = setup([], "", {
      history: ["Iracema"],
      error: "Falha ao carregar catálogo",
    });
    const screen = await renderSearch();

    await act(async () => {
      fireEvent(screen.getByLabelText("Buscar livros"), "submitEditing");
    });
    expect(registerSearch).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText(/Selecionar local em Piripiri/));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Selecionar ponto de encontro Praça da Bandeira"));
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Filtrar por Venda"));
    });
    expect(setModality).toHaveBeenCalledWith("sale");

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar histórico de buscas"));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar histórico de buscas"));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Limpar histórico" }));
    });
    expect(clearHistory).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Tentar novamente"));
    });
    expect(reload).toHaveBeenCalled();
  });
});
