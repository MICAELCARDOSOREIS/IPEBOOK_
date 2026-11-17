
import { act, fireEvent, render } from "@testing-library/react-native";
import type { ReceivedRatingsState, ReceivedRatingsActions } from "@/viewmodel/useReceivedRatingsViewModel";
import ReceivedRatingsScreen, { ReceivedRatings } from "@/view/profile/receivedRatings";

jest.mock("@/viewmodel/useReceivedRatingsViewModel", () => ({
  useReceivedRatingsViewModel: jest.fn(),
}));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));

import { useReceivedRatingsViewModel } from "@/viewmodel/useReceivedRatingsViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedUseReceivedRatingsViewModel = jest.mocked(useReceivedRatingsViewModel);
const mockedUseAuthViewModel = jest.mocked(useAuthViewModel);

function mockViewModel(state: ReceivedRatingsState, actions: Partial<ReceivedRatingsActions> = {}) {
  const fullActions: ReceivedRatingsActions = { reload: jest.fn().mockResolvedValue(undefined), ...actions };
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

  it("mostra estado vazio quando não há avaliações e permite voltar ao perfil", async () => {
    mockViewModel({ ratings: [], loading: false, error: null });
    const onBack = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReceivedRatings sessionUserId="bia" onBack={onBack} />);
    });
    expect(screen.getByText("Você ainda não recebeu avaliações")).toBeDefined();
    expect(
      screen.getByText(
        "As avaliações aparecem aqui depois que uma venda, troca ou doação é concluída e a outra pessoa conta como foi.",
      ),
    ).toBeDefined();
    await fireEvent.press(screen.getByLabelText("Voltar ao perfil"));
    expect(onBack).toHaveBeenCalledTimes(1);
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
      { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() },
    ]);
    const onNavigateToSignIn = jest.fn();
    await act(async () => {
      await render(<ReceivedRatingsScreen onBack={() => {}} onNavigateToSignIn={onNavigateToSignIn} />);
    });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });
});
