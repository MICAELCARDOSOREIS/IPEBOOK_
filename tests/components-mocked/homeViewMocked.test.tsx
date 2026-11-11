
import { View } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import Home from "@/view/home";
import {
  resetAppLaunchCelebrationForTesting,
  subscribeIpePetals,
} from "@/view/components/ipeCelebrationController";

// Mock explícito da ViewModel para isolamento determinístico da View
// Motivo: Simular cenários de rede instável, erro e carregamento contínuo
// sem dependência do ciclo de vida assíncrono real de efeitos ou timers.
vi.mock("@/viewmodel/useHomeViewModel", () => {
  return {
    useHomeViewModel: vi.fn(),
  };
});
vi.mock("@/viewmodel/useNetworkStatus", () => ({ useNetworkStatus: vi.fn() }));
vi.mock("@/view/components/IpePetalsCelebration", () => ({
  IpePetalsCelebration: (props: any) =>
    props.active ? <View testID={props.testID ?? "ipe-petals-celebration"} /> : null,
}));

import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";
const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);
vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });

describe("testes de componente com mock: Home (ISO/IEC 25010 - Usabilidade e Confiabilidade)", () => {
  it("renderiza indicador de carregamento e acessibilidade quando loading é true", async () => {
    const mockState: HomeState = {
      books: [],
      loading: true,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getByText("Carregando livros…")).toBeDefined();
    expect(screen.getByLabelText("Carregando livros")).toBeDefined();
    expect(screen.queryByText("Ainda não há livros por aqui.")).toBeNull();
  });

  it("renderiza alerta de erro e botão de nova tentativa quando error está presente", async () => {
    const mockState: HomeState = {
      books: [],
      loading: false,
      error: "Falha de conexão com o catálogo remoto.",
    };
    const reloadMock = vi.fn().mockResolvedValue(undefined);
    const mockActions: HomeActions = { reload: reloadMock };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Falha de conexão com o catálogo remoto.")).toBeDefined();

    const button = screen.getByText("Tentar novamente");
    expect(button).toBeDefined();

    await act(async () => {
      fireEvent.press(button);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("mostra o estado de sem conexão em vez do erro genérico quando o dispositivo está offline (Issue #76)", async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    const mockState: HomeState = { books: [], loading: false, error: "Falha de conexão." };
    mockedUseHomeViewModel.mockReturnValue([mockState, { reload: vi.fn() }]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<Home />); });

    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });

  it("renderiza catálogo de livros populado com títulos e autores", async () => {
    const mockState: HomeState = {
      books: [
        { id: "1", title: "O Alquimista", author: "Paulo Coelho", ownerId: "u1", modality: "trade" as const, status: "available" as const },
        { id: "2", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u2", modality: "donation" as const, status: "available" as const },
      ],
      loading: false,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getAllByText("O Alquimista").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Paulo Coelho").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Dom Casmurro").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Machado de Assis").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Carregando livros…")).toBeNull();
    expect(screen.queryByText("Ainda não há livros por aqui.")).toBeNull();
  });

  it("exibe a tag textual de modalidade de cada anúncio, nunca só a cor", async () => {
    const mockState: HomeState = {
      books: [
        { id: "1", title: "O Alquimista", author: "Paulo Coelho", ownerId: "u1", modality: "trade" as const, status: "available" as const },
        { id: "2", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u2", modality: "donation" as const, status: "available" as const },
      ],
      loading: false,
      error: null,
    };
    const mockActions: HomeActions = { reload: vi.fn() };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getAllByText("Troca").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Doação").length).toBeGreaterThanOrEqual(1);
  });

  describe("seções destacadas da Home (Figma 02.01, Issue #146)", () => {
    const books: HomeState["books"] = [
      { id: "1", title: "O Alquimista", author: "Paulo Coelho", ownerId: "u1", modality: "trade" as const, status: "available" as const },
      { id: "2", title: "A Hora da Estrela", author: "Clarice Lispector", ownerId: "u2", modality: "donation" as const, status: "available" as const },
      { id: "3", title: "Vidas Secas", author: "Graciliano Ramos", ownerId: "u3", modality: "donation" as const, status: "reserved" as const },
    ];

    function setupBooks() {
      mockedUseHomeViewModel.mockReturnValue([{ books, loading: false, error: null }, { reload: vi.fn() }]);
    }

    it("mostra 'Recém-adicionados' com os livros do catálogo e aciona 'Ver mais' sem filtro", async () => {
      setupBooks();
      const onNavigateToSearch = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<Home onNavigateToSearch={onNavigateToSearch} />);
      });

      expect(screen.getByRole("header", { name: "Recém-adicionados" })).toBeDefined();
      fireEvent.press(screen.getByLabelText("Ver mais livros recém-adicionados"));
      expect(onNavigateToSearch).toHaveBeenCalledTimes(1);
      expect(onNavigateToSearch.mock.calls[0]).toEqual([]);
    });

    it("resume no destaque 'Doações da semana' só as doações disponíveis e abre a Pesquisa filtrada", async () => {
      setupBooks();
      const onNavigateToSearch = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<Home onNavigateToSearch={onNavigateToSearch} />);
      });

      const expectedCount = books.filter((b) => b.modality === "donation" && b.status === "available").length;
      const summary = `${expectedCount} ${expectedCount === 1 ? "livro gratuito" : "livros gratuitos"} em Piripiri`;
      expect(screen.getByText(summary)).toBeDefined();

      fireEvent.press(screen.getByLabelText(`Doações da semana: ${summary}`));
      expect(onNavigateToSearch).toHaveBeenCalledWith({ modality: "donation" });
    });

    it("não inventa quantidade de doações quando não há nenhuma disponível", async () => {
      mockedUseHomeViewModel.mockReturnValue([
        { books: [books[0]], loading: false, error: null },
        { reload: vi.fn() },
      ]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<Home />);
      });
      expect(screen.getByText("Veja as doações em Piripiri")).toBeDefined();
      expect(screen.queryByText(/livros? gratuitos? em Piripiri/)).toBeNull();
    });

    it("navega entre os itens do carrossel pelos botões Anterior/Próximo", async () => {
      setupBooks();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<Home />);
      });

      const nextButton = screen.getByLabelText("Próximo item de Recém-adicionados");
      expect(screen.getByLabelText("Item anterior de Recém-adicionados").props.accessibilityState.disabled).toBe(true);
      expect(nextButton.props.accessibilityState.disabled).toBe(false);

      await act(async () => {
        fireEvent.press(nextButton);
      });
      expect(screen.getByLabelText("Item anterior de Recém-adicionados").props.accessibilityState.disabled).toBe(false);
    });
  });

  it("recarrega o catálogo quando focusKey muda (ex.: ao voltar de cadastrar um anúncio)", async () => {
    const mockState: HomeState = { books: [], loading: false, error: null };
    const reloadMock = vi.fn().mockResolvedValue(undefined);
    const mockActions: HomeActions = { reload: reloadMock };
    mockedUseHomeViewModel.mockReturnValue([mockState, mockActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home focusKey={0} />);
    });

    expect(reloadMock).not.toHaveBeenCalled();

    await act(async () => {
      screen.rerender(<Home focusKey={1} />);
    });

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  describe("seção hiperlocal por ponto de encontro / local ativo em Piripiri (Spec 068 / ADR 0051)", () => {
    const mixedBooks: HomeState["books"] = [
      {
        id: "1",
        title: "Livro da Praça",
        author: "Autor A",
        ownerId: "u1",
        modality: "sale",
        status: "available",
        neighborhood: "Praça da Bandeira",
      },
      {
        id: "2",
        title: "Livro do IFPI",
        author: "Autor B",
        ownerId: "u2",
        modality: "donation",
        status: "available",
        neighborhood: "Campus IFPI Piripiri",
      },
    ];

    it("filtra os livros do ponto de encontro ativo e atualiza título do carrossel", async () => {
      mockedUseHomeViewModel.mockReturnValue([
        { books: mixedBooks, loading: false, error: null },
        { reload: vi.fn() },
      ]);
      const onNavigateToSearch = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(
          <Home currentNeighborhood="Campus IFPI Piripiri" onNavigateToSearch={onNavigateToSearch} />,
        );
      });

      expect(screen.getByText("Em Campus IFPI Piripiri")).toBeDefined();
      expect(screen.getAllByText("Livro do IFPI").length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText("Livro da Praça")).toBeNull();

      fireEvent.press(screen.getByLabelText("Ver mais livros recém-adicionados"));
      expect(onNavigateToSearch).toHaveBeenCalledWith({ neighborhood: "Campus IFPI Piripiri" });
    });

    it("exibe estado de ausência acolhedor quando não há livros no ponto de encontro selecionado", async () => {
      mockedUseHomeViewModel.mockReturnValue([
        { books: mixedBooks, loading: false, error: null },
        { reload: vi.fn() },
      ]);
      const onNavigateToSearch = vi.fn();
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(
          <Home currentNeighborhood="Museu de Piripiri" onNavigateToSearch={onNavigateToSearch} />,
        );
      });

      expect(screen.getByText("Em Museu de Piripiri")).toBeDefined();
      expect(screen.getByText("Ainda não há livros no Museu de Piripiri.")).toBeDefined();

      const exploreAllBtn = screen.getByLabelText("Ver livros em toda Piripiri");
      expect(exploreAllBtn).toBeDefined();
      fireEvent.press(exploreAllBtn);
      expect(onNavigateToSearch).toHaveBeenCalledWith({ neighborhood: "all" });
    });

    it("exibe o selo de local no card do livro quando definido (Spec 070 / ADR 0053)", async () => {
      mockedUseHomeViewModel.mockReturnValue([
        { books: mixedBooks, loading: false, error: null },
        { reload: vi.fn() },
      ]);
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<Home currentNeighborhood="Campus IFPI Piripiri" />);
      });

      expect(screen.getAllByText("Campus IFPI Piripiri").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByLabelText("Ver detalhe de Livro do IFPI, Autor B em Campus IFPI Piripiri")).toBeDefined();
    });
  });

  describe("Micro-interação da florada de Ipê (Controle de disparo)", () => {
    it("não ativa florada ao carregar ou recarregar a Home, apenas ao tocar no Ipê", async () => {
      resetAppLaunchCelebrationForTesting();
      const onPetalTrigger = vi.fn();
      const unsubscribe = subscribeIpePetals(onPetalTrigger);

      mockedUseHomeViewModel.mockReturnValue([
        { books: [], loading: false, error: null },
        { reload: vi.fn() },
      ]);

      // 1. Primeira entrada do aplicativo: não deve soltar pétalas
      await act(async () => {
        await render(<Home />);
      });
      expect(onPetalTrigger).not.toHaveBeenCalled();

      // 2. Simulação de navegação / recarga: usuário volta para a Home
      let screen2!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen2 = await render(<Home />);
      });
      expect(onPetalTrigger).not.toHaveBeenCalled();

      // 3. Toque explícito na árvore do Ipê
      const ipeButton = screen2.getByLabelText("Celebrar florada do Ipê");
      await act(async () => {
        fireEvent.press(ipeButton);
      });
      expect(onPetalTrigger).toHaveBeenCalledTimes(1);
      expect(onPetalTrigger).toHaveBeenNthCalledWith(1, "celebration");

      unsubscribe();
    });
  });
});
