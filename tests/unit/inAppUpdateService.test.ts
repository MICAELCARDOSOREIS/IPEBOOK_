import { describe, expect, it } from "vitest";
import { MemoryInAppUpdateService } from "@/infra/services/memoryInAppUpdateService";
import { GooglePlayInAppUpdateService } from "@/infra/services/googlePlayInAppUpdateService";

describe("serviços de in-app updates", () => {
  it("MemoryInAppUpdateService simula detecção e fluxo de atualização", async () => {
    const service = new MemoryInAppUpdateService({ isUpdateAvailable: false });
    expect((await service.checkStoreUpdate()).isUpdateAvailable).toBe(false);
    expect(await service.startUpdateFlow()).toBe(false);

    service.setMockInfo({
      isUpdateAvailable: true,
      versionCode: 42,
      versionName: "0.2.0",
    });

    const check = await service.checkStoreUpdate();
    expect(check.isUpdateAvailable).toBe(true);
    expect(check.versionName).toBe("0.2.0");
    expect(await service.startUpdateFlow()).toBe(true);
  });

  it("GooglePlayInAppUpdateService retorna false com segurança quando fora de dispositivo Android real", async () => {
    const service = new GooglePlayInAppUpdateService();
    const result = await service.checkStoreUpdate();
    expect(result.isUpdateAvailable).toBe(false);
    expect(await service.startUpdateFlow()).toBe(false);
  });
});
