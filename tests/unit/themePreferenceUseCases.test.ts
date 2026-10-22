import { describe, expect, it } from "vitest";
import { MemoryThemePreferenceDataSource } from "@/infra/datasources/memoryThemePreferenceDataSource";
import type { IThemePreferenceDataSource } from "@/model/datasources/iThemePreferenceDataSource";
import { ThemePreferenceUseCases } from "@/usecase/themePreferenceUseCases";

describe("ThemePreferenceUseCases (Spec 043 / Issue #144)", () => {
  it("começa seguindo o tema do sistema e persiste a escolha manual", async () => {
    const useCases = new ThemePreferenceUseCases(new MemoryThemePreferenceDataSource());

    expect(await useCases.getPreference()).toBe("system");
    await useCases.setPreference("dark");
    expect(await useCases.getPreference()).toBe("dark");
  });

  it("volta para 'system' quando a leitura do armazenamento falha, sem bloquear o app", async () => {
    const broken: IThemePreferenceDataSource = {
      getPreference: async () => {
        throw new Error("armazenamento indisponível");
      },
      setPreference: async () => undefined,
    };

    expect(await new ThemePreferenceUseCases(broken).getPreference()).toBe("system");
  });

  it("não lança erro quando a gravação falha; a preferência só não persiste entre sessões", async () => {
    const broken: IThemePreferenceDataSource = {
      getPreference: async () => "system",
      setPreference: async () => {
        throw new Error("gravação recusada");
      },
    };

    await expect(new ThemePreferenceUseCases(broken).setPreference("light")).resolves.toBeUndefined();
  });
});
