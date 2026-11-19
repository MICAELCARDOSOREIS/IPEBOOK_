import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { AccessibilityInfo, Platform, StyleSheet } from "react-native";
import AuthCallback from "@/view/auth/authCallback";
import SignIn from "@/view/auth/signIn";
import Welcome from "@/view/onboarding/welcome";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";

jest.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: jest.fn(),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = jest.mocked(useAuthViewModel);

function mockAuth(state: AuthState = { user: null, loading: false, error: null }, actions: Partial<AuthActions> = {}) {
  mockedUseAuthViewModel.mockReturnValue([
    state,
    {
      signUp: jest.fn().mockResolvedValue(true),
      signIn: jest.fn().mockResolvedValue(true),
      signInWithGoogle: jest.fn().mockResolvedValue(true),
      handleAuthCallback: jest.fn().mockResolvedValue(true),
      signOut: jest.fn().mockResolvedValue(true),
      requestPasswordReset: jest.fn().mockResolvedValue(true),
      ...actions,
    },
  ]);
}

describe("Acesso e Onboarding iOS 26 (Spec 137 · #228)", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
    mockAuth();
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.restoreAllMocks();
  });

  it("renderiza Bem-vindo no iOS com pílulas de modalidade com haptic e botão secundário Liquid Glass", async () => {
    const selectionSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();
    const screen = await render(<Welcome onStart={() => {}} onSignIn={() => {}} />);

    expect(screen.getByText("PIRIPIRI · PIAUÍ")).toBeDefined();
    expect(screen.getByTestId("outlined-button-blur")).toBeDefined();

    fireEvent.press(screen.getByLabelText("Venda: toque para ver detalhes"));
    expect(selectionSpy).toHaveBeenCalledTimes(1);
  });

  it("renderiza Entrar no iOS com barra Liquid Glass e botão Google em vidro", async () => {
    const screen = await render(<SignIn onBack={() => {}} />);
    expect(screen.getByTestId("top-app-bar-back-blur")).toBeDefined();
    expect(screen.getByTestId("outlined-button-blur")).toBeDefined();
    expect(screen.getByLabelText("E-mail")).toBeDefined();
    expect(screen.getByLabelText("Senha")).toBeDefined();
  });

  it("mantém botão voltar acessível com alvo >= 44pt no erro de AuthCallback", async () => {
    mockAuth({ user: null, loading: false, error: "Link expirado." }, { handleAuthCallback: jest.fn().mockResolvedValue(false) });
    const onBack = jest.fn();
    let view!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      view = await render(<AuthCallback url="ipebook://auth/callback#error=expired" onSuccess={() => {}} onBackToSignIn={onBack} />);
    });

    const backButton = view.getByRole("button", { name: "Voltar para o login" });
    const style = StyleSheet.flatten(backButton.props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
