
const mockStore = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
  },
}));

import {
  AsyncStoragePermissionAskDataSource,
  permissionAskKey,
} from "@/infra/datasources/asyncStoragePermissionAskDataSource";

describe("AsyncStoragePermissionAskDataSource (Spec 020)", () => {
  beforeEach(() => {
    mockStore.clear();
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
    expect(mockStore.get(permissionAskKey("notifications"))).toBe("1");
  });

  it("qualquer valor que não seja o marcado conta como não perguntado", async () => {
    mockStore.set(permissionAskKey("photos"), "sim");
    expect(await new AsyncStoragePermissionAskDataSource("photos").hasAsked()).toBe(false);
  });
});
