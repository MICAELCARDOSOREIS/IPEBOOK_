import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import type { RequestDetailState, RequestDetailActions } from "@/viewmodel/useRequestDetailViewModel";
import RequestDetailScreen, { RequestDetail } from "@/view/requests/requestDetail";

const openURL = vi.fn();
vi.mock("expo-linking", () => ({
  openURL: (...args: unknown[]) => openURL(...args),
}));

vi.mock("@/viewmodel/useRequestDetailViewModel", () => ({
  useRequestDetailViewModel: vi.fn(),
}));

// O cartão do encontro (Spec 052) tem testes próprios; aqui ele começa sem convite.
let mockedMeeting: Record<string, unknown> | null = null;
vi.mock("@/viewmodel/useMeetingViewModel", () => ({
  useMeetingViewModel: () => [
    { meeting: mockedMeeting, loading: false, error: null, busy: false, actionError: null },
    { reload: vi.fn(), confirm: vi.fn(), cancel: vi.fn() },
  ],
}));

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

import { useRequestDetailViewModel } from "@/viewmodel/useRequestDetailViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedUseRequestDetailViewModel = vi.mocked(useRequestDetailViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockViewModel(state: RequestDetailState, actions: Partial<RequestDetailActions> = {}) {
  const fullActions: RequestDetailActions = {
    reload: vi.fn().mockResolvedValue(undefined),
    ...actions,
  };
  mockedUseRequestDetailViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("tela de Detalhes da Negociação (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  const fakeDetail: NegotiationDetail = {
    request: {
      id: "req-1",
      listingId: "b1",
      requesterId: "comprador-1",
      status: "accepted",
    },
    book: {
      id: "b1",
      title: "Memórias Póstumas",
      author: "Machado de Assis",
      modality: "sale",
      price: 35,
      ownerId: "vendedor-1",
      status: "reserved",
    },
    isOwner: true,
    counterpartName: "Ana Paula",
    counterpartId: "comprador-1",
    safeMeetingPoints: [
      {
        name: "Campus IFPI Piripiri",
        address: "Rodovia PI-112, Km 01, Piripiri, PI",
        recommendedTime: "Dias úteis, das 8h às 17h",
      },
      {
        name: "Praça da Bandeira",
        address: "Praça da Bandeira, Centro, Piripiri, PI",
        recommendedTime: "Diariamente, das 8h às 18h",
      },
    ],
  };

  it("Spec 043 RN-02: sem nome no perfil, não expõe o identificador interno", async () => {
    mockViewModel({ detail: { ...fakeDetail, counterpartName: null }, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.getByText("Pessoa da comunidade")).toBeDefined();
    expect(screen.queryByText("comprador-1")).toBeNull();
  });

  it("linha da pessoa com papel e Conversar abre a conversa (Spec 082 CA5, Spec 083 CA3)", async () => {
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    const onOpenChat = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" onOpenChat={onOpenChat} />);
    });
    expect(screen.queryByText("Participantes")).toBeNull();
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText(fakeDetail.isOwner ? "Quer o livro" : "Anunciou o livro")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Conversar com Ana Paula")); });
    expect(onOpenChat).toHaveBeenCalledWith("req-1");
  });

  it("destaca a etapa atual e mostra o encontro antes da pessoa (Spec 083, CA2/CA4)", async () => {
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.getByLabelText("Etapa atual: Combinar encontro")).toBeDefined();
    const order = screen.queryAllByText(/^(Combine o encontro|Conversar)$/).map((node) => node.props.children);
    expect(order).toEqual(["Combine o encontro", "Conversar"]);
  });

  it("renderiza cabeçalho e informações completas do acordo", async () => {
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    const onNavigateToBookDetail = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <RequestDetail
          requestId="req-1"
          sessionUserId="vendedor-1"
          onNavigateToBookDetail={onNavigateToBookDetail}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Acompanhar encontro" })).toBeDefined();
    expect(screen.queryByText("Negociação aceita!")).toBeNull();
    expect(screen.getByText("Memórias Póstumas")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.getByText("R$ 35,00")).toBeDefined();
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("• Campus IFPI Piripiri")).toBeDefined();
    expect(screen.getByText("• Praça da Bandeira")).toBeDefined();
    expect(screen.getByText("Rodovia PI-112, Km 01, Piripiri, PI")).toBeDefined();

    const bookCard = screen.getByRole("button", {
      name: "Ver anúncio de Memórias Póstumas",
    });
    fireEvent.press(bookCard);
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("b1");
  });

  it("mostra o andamento e só pede a conclusão depois do encontro (Spec 079)", async () => {
    mockViewModel({ detail: fakeDetail, loading: false, error: null });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });

    expect(
      screen.getByLabelText("Andamento: 1 de 3 etapas. Combinar encontro"),
    ).toBeDefined();
    expect(
      screen.getByText("Depois do encontro e da entrega do livro, volte aqui para concluir e avaliar."),
    ).toBeDefined();
  });

  it("convite da outra pessoa mostra Sua vez no topo (Spec 080)", async () => {
    mockedMeeting = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2099-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "proposed",
    };
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.getByText(/^Sua vez:/)).toBeDefined();
    mockedMeeting = null;
  });

  it("encontro combinado recolhe os pontos seguros e permite expandir (Spec 080)", async () => {
    mockedMeeting = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2099-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "confirmed",
    };
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.queryByRole("button", { name: "Como chegar à Campus IFPI Piripiri" })).toBeNull();
    expect(screen.getByLabelText("Andamento: 2 de 3 etapas. Concluída")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Ver pontos seguros de Piripiri" }));
    });
    expect(screen.getByRole("button", { name: "Como chegar à Campus IFPI Piripiri" })).toBeDefined();
    mockedMeeting = null;
  });

  it("puxar para atualizar recarrega sem esconder o conteúdo (Spec 080)", async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    mockedUseRequestDetailViewModel.mockReturnValue([
      { detail: fakeDetail, loading: true, error: null },
      { reload },
    ]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.queryByText("Carregando detalhes…")).toBeNull();
    const scroll = screen.getByTestId("request-detail-scroll");
    await act(async () => {
      await scroll.props.refreshControl.props.onRefresh();
    });
    expect(reload).toHaveBeenCalled();
  });

  it("abre o app de mapas ao tocar em 'Como chegar'", async () => {
    openURL.mockReset().mockResolvedValue(undefined);
    mockViewModel({ detail: fakeDetail, loading: false, error: null });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <RequestDetail requestId="req-1" sessionUserId="vendedor-1" />,
      );
    });

    const directionsButton = screen.getByRole("button", {
      name: "Como chegar à Campus IFPI Piripiri",
    });
    await act(async () => {
      fireEvent.press(directionsButton);
    });

    expect(openURL).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Rodovia PI-112, Km 01, Piripiri, PI")),
    );
  });

  it("exibe mensagem de erro quando o app de mapas não pode ser aberto", async () => {
    openURL.mockReset().mockRejectedValue(new Error("sem app de mapas"));
    mockViewModel({ detail: fakeDetail, loading: false, error: null });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <RequestDetail requestId="req-1" sessionUserId="vendedor-1" />,
      );
    });

    const directionsButton = screen.getByRole("button", {
      name: "Como chegar à Campus IFPI Piripiri",
    });
    await act(async () => {
      fireEvent.press(directionsButton);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(
      screen.getByText('Não foi possível abrir o mapa para "Campus IFPI Piripiri". Tente novamente.'),
    ).toBeDefined();
  });

  it("exibe indicador de carregamento", async () => {
    mockViewModel({ detail: null, loading: true, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });

    expect(screen.getByLabelText("Carregando detalhes da negociação")).toBeDefined();
  });

  it("exibe erro e botão de nova tentativa", async () => {
    const actions = mockViewModel({
      detail: null,
      loading: false,
      error: "Falha de rede.",
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });

    expect(screen.getByRole("alert").props.children).toBe("Falha de rede.");
    const retryBtn = screen.getByRole("button", { name: "Tentar novamente" });
    fireEvent.press(retryBtn);
    expect(actions.reload).toHaveBeenCalledTimes(1);
  });

  it("redireciona para login se o usuário não tiver sessão", async () => {
    mockedUseAuthViewModel.mockReturnValue([
      { user: null, loading: false, error: null },
      { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ]);
    const onRequireSignIn = vi.fn();

    await act(async () => {
      await render(<RequestDetailScreen requestId="req-1" onRequireSignIn={onRequireSignIn} />);
    });

    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });
});
