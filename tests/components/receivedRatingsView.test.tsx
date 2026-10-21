import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ReceivedRatingsState, ReceivedRatingsActions } from "@/viewmodel/useReceivedRatingsViewModel";
import ReceivedRatingsScreen, { ReceivedRatings } from "@/view/profile/receivedRatings";

vi.mock("@/viewmodel/useReceivedRatingsViewModel", () => ({
  useReceivedRatingsViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedUseReceivedRatingsViewModel = vi.mocked(useReceivedRatingsViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockViewModel(state: ReceivedRatingsState, actions: Partial<ReceivedRatingsActions> = {}) {
  const fullActions: ReceivedRatingsActions = { reload: vi.fn().mockResolvedValue(undefined), ...actions };
  mockedUseReceivedRatingsViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

describe("tela de Avaliações recebidas (Figma 07.03, ISO/IEC 25010 - Usabilidade)", () => {
  it("mostra indicador de carregamento", async () => {
    mockViewModel({ ratings: [], loading: true, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReceivedRatings sessionUserId="bia" onBack={() => {}} />);
    });
    expect(screen.getByLabelText("Carregando avaliações")).toBeDefined();
  });

  it("mostra estado vazio quando não há avaliações", async () => {
    mockViewModel({ ratings: [], loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReceivedRatings sessionUserId="bia" onBack={() => {}} />);
    });
    expect(screen.getByText("Você ainda não recebeu avaliações.")).toBeDefined();
  });

  it("lista as avaliações com nota, nome e data", async () => {
    mockViewModel({
      ratings: [
        { id: "r1", raterId: "ana", raterName: "Ana Paula", score: 5, createdAt: "2026-01-15T00:00:00.000Z" },
      ],
      loading: false,
      error: null,
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReceivedRatings sessionUserId="bia" onBack={() => {}} />);
    });
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByLabelText("Nota 5 de 5")).toBeDefined();
  });

  it("mostra erro e permite tentar novamente", async () => {
    const actions = mockViewModel({ ratings: [], loading: false, error: "Falha de rede." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReceivedRatings sessionUserId="bia" onBack={() => {}} />);
    });
    fireEvent.press(screen.getByLabelText("Tentar novamente"));
    expect(actions.reload).toHaveBeenCalledTimes(1);
  });

  it("redireciona para login se não houver sessão", async () => {
    mockedUseAuthViewModel.mockReturnValue([
      { user: null, loading: false, error: null },
      { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ]);
    const onNavigateToSignIn = vi.fn();
    await act(async () => {
      await render(<ReceivedRatingsScreen onBack={() => {}} onNavigateToSignIn={onNavigateToSignIn} />);
    });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });
});
