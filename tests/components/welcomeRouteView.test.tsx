import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import WelcomeRoute from "@/view/onboarding/welcomeRoute";

vi.mock("@/viewmodel/useWelcomeGateViewModel", () => ({
  useWelcomeGateViewModel: vi.fn(),
}));

import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";
const mockedGate = vi.mocked(useWelcomeGateViewModel);

async function renderRoute() {
  const dismiss = vi.fn().mockResolvedValue(undefined);
  const onFinish = vi.fn();
  mockedGate.mockReturnValue(["skip", dismiss]);
  const screen = await render(<WelcomeRoute onFinish={onFinish} />);
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

  it("não oferece acesso de visitante ao catálogo (Spec 092)", async () => {
    const { screen, dismiss, onFinish } = await renderRoute();

    expect(screen.queryByRole("button", { name: /Explorar/i })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Já tenho conta" }));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith("/entrar");
    expect(onFinish).not.toHaveBeenCalledWith("/");
  });
});
