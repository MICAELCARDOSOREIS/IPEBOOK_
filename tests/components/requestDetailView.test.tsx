import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import type { RequestDetailState, RequestDetailActions } from "@/viewmodel/useRequestDetailViewModel";
import RequestDetailScreen, { RequestDetail } from "@/view/requests/requestDetail";

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

// Situação da entrega por QR (Spec 095); começa sem papel nem conclusão.
let mockedDelivery: { loading: boolean; role: "giver" | "receiver" | null; completed: Record<string, unknown> | null } = {
  loading: false,
  role: null,
  completed: null,
};
vi.mock("@/viewmodel/useDeliveryViewModel", () => ({
  useDeliveryStatus: () => mockedDelivery,
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
        latitude: -4.2741994,
        longitude: -41.7777509,
      },
      {
        name: "Praça da Bandeira",
        address: "Praça da Bandeira, Centro, Piripiri, PI",
        recommendedTime: "Diariamente, das 8h às 18h",
        latitude: -4.2741994,
        longitude: -41.7777509,
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
    // Os pontos de encontro são escolhidos no mapa de "Combinar encontro" (Spec 094), não mais nesta tela.
    expect(screen.queryByText("Encontro seguro em Piripiri")).toBeNull();
    expect(screen.queryByRole("button", { name: "Como chegar à Campus IFPI Piripiri" })).toBeNull();

    const bookCard = screen.getByRole("button", {
      name: "Ver anúncio de Memórias Póstumas",
    });
    fireEvent.press(bookCard);
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("b1");
  });

  it("mostra o andamento sem o cartão de conclusão, que virá por QR code (Spec 094)", async () => {
    mockViewModel({ detail: fakeDetail, loading: false, error: null });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });

    expect(
      screen.getByLabelText("Andamento: 1 de 3 etapas. Combinar encontro"),
    ).toBeDefined();
    expect(screen.queryByText("Concluir negociação")).toBeNull();
    expect(screen.queryByRole("button", { name: "Já fizemos a entrega" })).toBeNull();
  });

  it("depois do encontro também não mostra o cartão de conclusão (Spec 094)", async () => {
    mockedMeeting = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2020-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "confirmed",
    };
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.queryByLabelText("Concluir negociação e avaliar")).toBeNull();
    expect(screen.queryByRole("button", { name: "Já fizemos a entrega" })).toBeNull();
    mockedMeeting = null;
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

  describe("entrega por QR code (Spec 095, CA6/CA7)", () => {
    const confirmed = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2099-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "confirmed",
    };

    async function open(onOpenDelivery = vi.fn()) {
      mockViewModel({ detail: fakeDetail, loading: false, error: null });
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" onOpenDelivery={onOpenDelivery} />);
      });
      return { screen, onOpenDelivery };
    }

    it("sem encontro confirmado, não oferece a entrega", async () => {
      mockedMeeting = null;
      mockedDelivery = { loading: false, role: "giver", completed: null };
      const { screen } = await open();
      expect(screen.queryByTestId("delivery-card")).toBeNull();
    });

    it("anunciante com encontro confirmado mostra o QR da entrega", async () => {
      mockedMeeting = confirmed;
      mockedDelivery = { loading: false, role: "giver", completed: null };
      const { screen, onOpenDelivery } = await open();
      await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Mostrar QR da entrega" })); });
      expect(onOpenDelivery).toHaveBeenCalledTimes(1);
    });

    it("leitor com encontro confirmado lê o QR da entrega", async () => {
      mockedMeeting = confirmed;
      mockedDelivery = { loading: false, role: "receiver", completed: null };
      const { screen } = await open();
      expect(screen.getByRole("button", { name: "Ler QR da entrega" })).toBeDefined();
    });

    it("entrega concluída marca a etapa 3 e oferece avaliar", async () => {
      mockedMeeting = confirmed;
      mockedDelivery = { loading: false, role: "receiver", completed: { requestId: "req-1", completedBy: "u", completedAt: "2026-10-29T10:00:00.000Z" } };
      const { screen } = await open();
      expect(screen.getByRole("header", { name: "Entrega concluída" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Avaliar negociação" })).toBeDefined();
      expect(screen.getByLabelText("Andamento: 3 de 3 etapas. Tudo concluído")).toBeDefined();
    });

    it("limpa o estado dos testes", () => {
      mockedMeeting = null;
      mockedDelivery = { loading: false, role: null, completed: null };
    });
  });

  it("encontro combinado não lista mais os pontos seguros (Spec 094)", async () => {
    mockedMeeting = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2099-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "confirmed",
    };
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetail requestId="req-1" sessionUserId="vendedor-1" />);
    });
    expect(screen.queryByText("Encontro seguro em Piripiri")).toBeNull();
    expect(screen.queryByRole("button", { name: "Ver pontos seguros de Piripiri" })).toBeNull();
    expect(screen.getByLabelText("Andamento: 2 de 3 etapas. Concluída")).toBeDefined();
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

  it("a tela com sessão repassa a ação de abrir a entrega (regressão: o toque não fazia nada)", async () => {
    mockedUseAuthViewModel.mockReturnValue([
      { user: { id: "vendedor-1", name: "Ana", email: "a@b.c" } as never, loading: false, error: null },
      { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ]);
    mockedMeeting = {
      id: "m1", requestId: "req-1", pointName: "Praça da Bandeira (Centro)",
      scheduledAt: "2099-01-01T15:00:00.000Z", proposedBy: "comprador-1", status: "confirmed",
    };
    mockedDelivery = { loading: false, role: "giver", completed: null };
    mockViewModel({ detail: fakeDetail, loading: false, error: null });
    const onOpenDelivery = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<RequestDetailScreen requestId="req-1" onOpenDelivery={onOpenDelivery} />);
    });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Mostrar QR da entrega" })); });

    expect(onOpenDelivery).toHaveBeenCalledTimes(1);
    mockedMeeting = null;
    mockedDelivery = { loading: false, role: null, completed: null };
  });
});
