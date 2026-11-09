import { describe, expect, it, vi } from "vitest";
import {
  compareSemver,
  evaluateAppUpdateStatus,
  type AppVersionPolicy,
} from "@/model/entities/appUpdate";
import { AppUpdateUseCases } from "@/usecase/appUpdateUseCases";
import { MemoryInAppUpdateService } from "@/infra/services/memoryInAppUpdateService";

const policy: AppVersionPolicy = {
  platform: "android",
  latestVersion: "0.2.0",
  minSupportedVersion: "0.1.0",
  releaseNotes: "Melhorias.",
  storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app",
};

function createUseCases(dismissedVersion: string | null = null, inAppService?: MemoryInAppUpdateService) {
  let dismissed = dismissedVersion;
  const policyDataSource = { getPolicy: vi.fn(async () => policy) };
  const dismissDataSource = {
    getDismissedVersion: vi.fn(async () => dismissed),
    dismissVersion: vi.fn(async (version: string) => {
      dismissed = version;
    }),
  };
  const storeLauncher = { openStore: vi.fn(async () => {}) };
  return {
    useCases: new AppUpdateUseCases(
      policyDataSource,
      dismissDataSource,
      storeLauncher,
      "0.1.0",
      inAppService,
    ),
    dismissDataSource,
    storeLauncher,
  };
}

describe("regras de atualização do app", () => {
  it("compara versões semânticas e rejeita entradas inválidas com segurança", () => {
    expect(compareSemver("0.2.0", "0.1.9")).toBe(1);
    expect(compareSemver("0.1.0", "0.1.0")).toBe(0);
    expect(compareSemver("invalida", "0.1.0")).toBe(0);
    expect(evaluateAppUpdateStatus("0.0.9", policy)).toBe("required");
    expect(evaluateAppUpdateStatus("0.1.0", policy)).toBe("optional");
    expect(evaluateAppUpdateStatus("0.2.0", policy)).toBe("up_to_date");
  });

  it("dispensa a versão opcional, mas mantém a atualização obrigatória", async () => {
    const optional = createUseCases();
    expect((await optional.useCases.checkUpdate()).status).toBe("optional");
    await optional.useCases.dismiss("0.2.0");
    expect((await optional.useCases.checkUpdate()).status).toBe("up_to_date");

    const required = new AppUpdateUseCases(
      { getPolicy: async () => ({ ...policy, minSupportedVersion: "0.2.0" }) },
      optional.dismissDataSource,
      optional.storeLauncher,
      "0.1.0",
    );
    expect((await required.checkUpdate()).status).toBe("required");
  });

  it("não interrompe a abertura quando a política falha", async () => {
    const useCases = new AppUpdateUseCases(
      { getPolicy: async () => { throw new Error("offline"); } },
      { getDismissedVersion: async () => null, dismissVersion: async () => {} },
      { openStore: async () => {} },
      "0.1.0",
    );
    await expect(useCases.checkUpdate()).resolves.toEqual({ status: "up_to_date", policy: null });
  });

  it("detecta atualização diretamente pelo serviço de loja (Google Play)", async () => {
    const inAppService = new MemoryInAppUpdateService({
      isUpdateAvailable: true,
      versionName: "0.3.0",
    });
    const ctx = createUseCases(null, inAppService);

    const result = await ctx.useCases.checkUpdate();
    expect(result.status).toBe("optional");
    expect(result.policy?.latestVersion).toBe("0.3.0");

    // Ao chamar openStore, utiliza startUpdateFlow se disponível
    const spy = vi.spyOn(inAppService, "startUpdateFlow");
    await ctx.useCases.openStore("https://play.google.com/store/apps/details?id=com.ipebook.app");
    expect(spy).toHaveBeenCalled();
    expect(ctx.storeLauncher.openStore).not.toHaveBeenCalled();
  });

  it("ignora atualização da loja se o usuário já tiver dispensado aquela versão", async () => {
    const inAppService = new MemoryInAppUpdateService({
      isUpdateAvailable: true,
      versionName: "0.3.0",
    });
    const ctx = createUseCases("0.3.0", inAppService);

    // Como 0.3.0 já foi dispensado, retorna up_to_date
    const result = await ctx.useCases.checkUpdate();
    expect(result.status).toBe("up_to_date");
  });
});
