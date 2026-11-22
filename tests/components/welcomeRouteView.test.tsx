
import { fireEvent, render } from "@testing-library/react-native";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

jest.mock("@/viewmodel/useWelcomeGateViewModel", () => ({
  useWelcomeGateViewModel: jest.fn(),
}));

import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";
const mockedGate = jest.mocked(useWelcomeGateViewModel);

async function renderRoute(onExplore?: () => void) {
  const dismiss = jest.fn().mockResolvedValue(undefined);
  const onFinish = jest.fn();
  mockedGate.mockReturnValue(["skip", dismiss]);
  const screen = await render(<WelcomeRoute onFinish={onFinish} onExplore={onExplore} />);
  return { screen, dismiss, onFinish };
}

describe("WelcomeRoute (issue #98)", () => {
  it("marca as boas-vindas como vistas e segue para criar conta ao tocar em Começar", async () => {
    const { screen, dismiss, onFinish } = await renderRoute();

    fireEvent.press(screen.getByRole("button", { name: "Começar" }));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith("/criar-conta");
  });

  it("marca como vistas e segue para entrar ao tocar em Já tenho conta", async () => {
    const { screen, dismiss, onFinish } = await renderRoute();

    fireEvent.press(screen.getByRole("button", { name: "Já tenho conta" }));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith("/entrar");
  });

  it("mantém o acesso de visitante ao catálogo restrito à Web", async () => {
    const { screen, dismiss, onFinish } = await renderRoute(jest.fn());

    expect(screen.queryByRole("button", { name: /Explorar/i })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Já tenho conta" }));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith("/entrar");
    expect(onFinish).not.toHaveBeenCalledWith("/");
  });
});
