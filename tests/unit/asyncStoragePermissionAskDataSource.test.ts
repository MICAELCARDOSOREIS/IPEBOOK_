import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  },
}));

import {
  AsyncStoragePermissionAskDataSource,
  permissionAskKey,
} from "@/infra/datasources/asyncStoragePermissionAskDataSource";

describe("AsyncStoragePermissionAskDataSource (Spec 020)", () => {
  beforeEach(() => {
    store.clear();
  });

  it("começa sem pergunta registrada", async () => {
    const ds = new AsyncStoragePermissionAskDataSource("notifications");
    expect(await ds.hasAsked()).toBe(false);
  });

  it("grava e recupera a pergunta por permissão", async () => {
    const notifications = new AsyncStoragePermissionAskDataSource("notifications");
    const photos = new AsyncStoragePermissionAskDataSource("photos");
    await notifications.markAsked();
    expect(await notifications.hasAsked()).toBe(true);
    expect(await photos.hasAsked()).toBe(false);
    expect(store.get(permissionAskKey("notifications"))).toBe("1");
  });

  it("qualquer valor que não seja o marcado conta como não perguntado", async () => {
    store.set(permissionAskKey("photos"), "sim");
    expect(await new AsyncStoragePermissionAskDataSource("photos").hasAsked()).toBe(false);
  });
});
