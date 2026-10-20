import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";
import { MemoryOnboardingDataSource } from "@/infra/datasources/memoryOnboardingDataSource";
import { OnboardingUseCases } from "@/usecase/onboardingUseCases";
import { useWelcomeGateViewModel } from "@/viewmodel/useWelcomeGateViewModel";

function GateProbe({ useCases }: { useCases: OnboardingUseCases }) {
  const [status, dismiss] = useWelcomeGateViewModel(useCases);
  return (
    <>
      <Text>{status}</Text>
      <Text onPress={() => void dismiss()}>dispensar</Text>
    </>
  );
}

describe("useWelcomeGateViewModel (issue #98)", () => {
  it("começa como checking e resolve para show no primeiro acesso", async () => {
    const screen = await render(<GateProbe useCases={new OnboardingUseCases(new MemoryOnboardingDataSource())} />);

    expect(await screen.findByText("show")).toBeTruthy();
  });

  it("resolve para skip quando a marca já existe", async () => {
    const source = new MemoryOnboardingDataSource();
    await source.markWelcomeSeen();

    const screen = await render(<GateProbe useCases={new OnboardingUseCases(source)} />);

    expect(await screen.findByText("skip")).toBeTruthy();
  });

  it("dispensar grava a marca sem alterar o status já resolvido na sessão", async () => {
    const markWelcomeSeen = vi.fn().mockResolvedValue(undefined);
    const useCases = { shouldShowWelcome: vi.fn().mockResolvedValue(true), markWelcomeSeen } as unknown as OnboardingUseCases;

    const screen = await render(<GateProbe useCases={useCases} />);
    await screen.findByText("show");
    await screen.getByText("dispensar").props.onPress();

    expect(markWelcomeSeen).toHaveBeenCalledTimes(1);
  });
});
