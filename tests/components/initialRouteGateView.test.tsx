import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";
import { InitialRouteGate } from "@/view/onboarding/initialRouteGate";
import type { WelcomeGateStatus } from "@/viewmodel/useWelcomeGateViewModel";

vi.mock("@/viewmodel/useWelcomeGateViewModel", () => ({
  useWelcomeGateViewModel: vi.fn(),
}));

import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";
const mockedGate = vi.mocked(useWelcomeGateViewModel);

function mockStatus(status: WelcomeGateStatus) {
  mockedGate.mockReturnValue([status, vi.fn().mockResolvedValue(undefined)]);
}

describe("InitialRouteGate (AD-18, issue #98)", () => {
  it("não mostra a rota inicial enquanto a decisão está pendente", async () => {
    mockStatus("checking");
    const onShowWelcome = vi.fn();

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
    const onShowWelcome = vi.fn();

    await render(
      <InitialRouteGate pathname="/" onShowWelcome={onShowWelcome}>
        <Text>catálogo</Text>
      </InitialRouteGate>,
    );

    expect(onShowWelcome).toHaveBeenCalledTimes(1);
  });

  it("não redireciona quando o app abre em outra rota, mesmo sem a marca", async () => {
    mockStatus("show");
    const onShowWelcome = vi.fn();

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
    const onShowWelcome = vi.fn();

    const screen = await render(
      <InitialRouteGate pathname="/" onShowWelcome={onShowWelcome}>
        <Text>catálogo</Text>
      </InitialRouteGate>,
    );

    expect(onShowWelcome).not.toHaveBeenCalled();
    expect(screen.getByText("catálogo")).toBeTruthy();
  });
});
