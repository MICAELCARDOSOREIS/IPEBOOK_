
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";
import type { WelcomeGateStatus } from "@/viewmodel/useWelcomeGateViewModel";

jest.mock("@/viewmodel/useWelcomeGateViewModel", () => ({
  useWelcomeGateViewModel: jest.fn(),
}));

import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";
const mockedGate = jest.mocked(useWelcomeGateViewModel);

function mockStatus(status: WelcomeGateStatus) {
  mockedGate.mockReturnValue([status, jest.fn().mockResolvedValue(undefined)]);
}

describe("InitialRouteGate (AD-18, issue #98)", () => {
  it("não mostra a rota inicial enquanto a decisão está pendente", async () => {
    mockStatus("checking");
    const onShowWelcome = jest.fn();

    const screen = await render(
      <InitialRouteGate pathname="/" onShowWelcome={onShowWelcome}>
        <Text>catálogo</Text>
      </InitialRouteGate>,
    );

    expect(screen.queryByText("catálogo")).toBeNull();
    expect(onShowWelcome).not.toHaveBeenCalled();
  });

  it("leva às boas-vindas quando o app abre em / sem a marca de primeiro acesso", async () => {
    mockStatus("show");
    const onShowWelcome = jest.fn();

    await render(
      <InitialRouteGate pathname="/" onShowWelcome={onShowWelcome}>
        <Text>catálogo</Text>
      </InitialRouteGate>,
    );

    expect(onShowWelcome).toHaveBeenCalledTimes(1);
  });

  it("não redireciona quando o app abre em outra rota, mesmo sem a marca", async () => {
    mockStatus("show");
    const onShowWelcome = jest.fn();

    const screen = await render(
      <InitialRouteGate pathname="/pesquisa" onShowWelcome={onShowWelcome}>
        <Text>pesquisa</Text>
      </InitialRouteGate>,
    );

    expect(onShowWelcome).not.toHaveBeenCalled();
    expect(screen.getByText("pesquisa")).toBeTruthy();
  });

  it("mostra a rota normalmente quando a marca já existe", async () => {
    mockStatus("skip");
    const onShowWelcome = jest.fn();

    const screen = await render(
      <InitialRouteGate pathname="/" onShowWelcome={onShowWelcome}>
        <Text>catálogo</Text>
      </InitialRouteGate>,
    );

    expect(onShowWelcome).not.toHaveBeenCalled();
    expect(screen.getByText("catálogo")).toBeTruthy();
  });
});
