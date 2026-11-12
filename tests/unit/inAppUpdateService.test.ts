import { describe, expect, it, vi } from "vitest";
import { NativeModules, Platform } from "react-native";
import { SupabaseAppVersionPolicyDataSource } from "@/infra/datasources/supabaseAppVersionPolicyDataSource";
import { GooglePlayInAppUpdateService } from "@/infra/services/googlePlayInAppUpdateService";
import { MemoryInAppUpdateService } from "@/infra/services/memoryInAppUpdateService";

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

  it("GooglePlayInAppUpdateService consulta módulo nativo IpebookPlayUpdate no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    (NativeModules as Record<string, unknown>).IpebookPlayUpdate = {
      checkStoreUpdate: vi.fn(async () => ({
        isUpdateAvailable: true,
        versionCode: 11,
        versionName: "0.1.0+11",
        installedVersionCode: 10,
        installedVersionName: "0.1.0",
      })),
      startUpdateFlow: vi.fn(async () => true),
    };

    try {
      const service = new GooglePlayInAppUpdateService();
      const result = await service.checkStoreUpdate();
      expect(result).toEqual({
        isUpdateAvailable: true,
        versionCode: 11,
        versionName: "0.1.0+11",
        installedVersionCode: 10,
        installedVersionName: "0.1.0",
      });
      expect(await service.startUpdateFlow()).toBe(true);
    } finally {
      delete (NativeModules as Record<string, unknown>).IpebookPlayUpdate;
      Platform.OS = originalOS;
    }
  });

  it("GooglePlayInAppUpdateService usa fallback RNSentry.fetchNativeRelease quando módulo nativo não está presente", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    (NativeModules as Record<string, unknown>).RNSentry = {
      fetchNativeRelease: vi.fn(async () => ({
        id: "com.ipebook.app",
        version: "0.1.0",
        build: "10",
      })),
    };

    try {
      const service = new GooglePlayInAppUpdateService();
      const result = await service.checkStoreUpdate();
      expect(result).toEqual({
        isUpdateAvailable: false,
        installedVersionCode: 10,
        installedVersionName: "0.1.0",
      });
      expect(await service.startUpdateFlow()).toBe(false);
    } finally {
      delete (NativeModules as Record<string, unknown>).RNSentry;
      Platform.OS = originalOS;
    }
  });

  it("GooglePlayInAppUpdateService trata erros nativos com segurança no Android", async () => {
    const originalOS = Platform.OS;
    Platform.OS = "android";
    (NativeModules as Record<string, unknown>).IpebookPlayUpdate = {
      checkStoreUpdate: vi.fn(async () => {
        throw new Error("Play Core indisponível");
      }),
      startUpdateFlow: vi.fn(async () => {
        throw new Error("Falha ao abrir fluxo");
      }),
    };

    try {
      const service = new GooglePlayInAppUpdateService();
      expect(await service.checkStoreUpdate()).toEqual({ isUpdateAvailable: false });
      expect(await service.startUpdateFlow()).toBe(false);
    } finally {
      delete (NativeModules as Record<string, unknown>).IpebookPlayUpdate;
      Platform.OS = originalOS;
    }
  });

  it("GooglePlayInAppUpdateService retorna false com segurança quando fora de dispositivo Android real", async () => {
    const service = new GooglePlayInAppUpdateService();
    const result = await service.checkStoreUpdate();
    expect(result.isUpdateAvailable).toBe(false);
    expect(await service.startUpdateFlow()).toBe(false);
  });

  it("SupabaseAppVersionPolicyDataSource mapeia política remota incluindo versionCode opcional", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: {
        platform: "android",
        latest_version: "0.1.0",
        min_supported_version: "0.1.0",
        latest_version_code: 11,
        min_supported_version_code: 10,
        release_notes: "Correções visuais",
        store_url: "https://play.google.com/store/apps/details?id=com.ipebook.app",
      },
      error: null,
    }));
    const client = {
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle }),
        }),
      }),
    } as never;

    const ds = new SupabaseAppVersionPolicyDataSource(client);
    const policy = await ds.getPolicy();
    expect(policy).toEqual({
      platform: "android",
      latestVersion: "0.1.0",
      minSupportedVersion: "0.1.0",
      latestVersionCode: 11,
      minSupportedVersionCode: 10,
      releaseNotes: "Correções visuais",
      storeUrl: "https://play.google.com/store/apps/details?id=com.ipebook.app",
    });
  });
});
