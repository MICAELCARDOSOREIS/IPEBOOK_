import { describe, expect, it } from "vitest";
import type { IOnboardingDataSource } from "@/model/datasources/iOnboardingDataSource";
import { MemoryOnboardingDataSource } from "@/infra/datasources/memoryOnboardingDataSource";
import { OnboardingUseCases } from "@/usecase/onboardingUseCases";

describe("OnboardingUseCases (primeiro acesso, issue #98)", () => {
  it("mostra as boas-vindas no primeiro acesso e não as mostra depois de marcadas", async () => {
    const useCases = new OnboardingUseCases(new MemoryOnboardingDataSource());

    expect(await useCases.shouldShowWelcome()).toBe(true);
    await useCases.markWelcomeSeen();
    expect(await useCases.shouldShowWelcome()).toBe(false);
  });

  it("mostra as boas-vindas quando a leitura do armazenamento falha, sem bloquear o app", async () => {
    const broken: IOnboardingDataSource = {
      hasSeenWelcome: async () => {
        throw new Error("armazenamento indisponível");
      },
      markWelcomeSeen: async () => undefined,
    };

    expect(await new OnboardingUseCases(broken).shouldShowWelcome()).toBe(true);
  });

  it("não lança erro quando a gravação falha; a tela só reaparece na próxima abertura", async () => {
    const broken: IOnboardingDataSource = {
      hasSeenWelcome: async () => false,
      markWelcomeSeen: async () => {
        throw new Error("gravação recusada");
      },
    };

    await expect(new OnboardingUseCases(broken).markWelcomeSeen()).resolves.toBeUndefined();
  });
});
