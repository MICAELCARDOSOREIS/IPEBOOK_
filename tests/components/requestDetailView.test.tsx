import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { NegotiationDetail } from "@/usecase/iBookRequestUseCases";
import type { RequestDetailState, RequestDetailActions } from "@/viewmodel/useRequestDetailViewModel";
import RequestDetailScreen, { RequestDetail } from "@/view/requests/requestDetail";

vi.mock("@/viewmodel/useRequestDetailViewModel", () => ({
  useRequestDetailViewModel: vi.fn(),
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
    counterpartId: "comprador-1",
    safeMeetingPoints: ["Campus IFPI Piripiri", "Praça da Bandeira"],
  };

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

    expect(screen.getByRole("header", { name: "Negociação" })).toBeDefined();
    expect(screen.getByText("Negociação aceita!")).toBeDefined();
    expect(screen.getByText("Memórias Póstumas")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.getByText("R$ 35.00")).toBeDefined();
    expect(screen.getByText("comprador-1")).toBeDefined();
    expect(screen.getByText("• Campus IFPI Piripiri")).toBeDefined();
    expect(screen.getByText("• Praça da Bandeira")).toBeDefined();

    const bookCard = screen.getByRole("button", {
      name: "Ver anúncio de Memórias Póstumas",
    });
    fireEvent.press(bookCard);
    expect(onNavigateToBookDetail).toHaveBeenCalledWith("b1");
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
