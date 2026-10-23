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
  AsyncStorageThemePreferenceDataSource,
  THEME_PREFERENCE_KEY,
} from "@/infra/datasources/asyncStorageThemePreferenceDataSource";

describe("AsyncStorageThemePreferenceDataSource (Spec 054 / Issue #144)", () => {
  beforeEach(() => {
    store.clear();
  });

  it("retorna 'system' quando nada foi salvo ainda", async () => {
    const ds = new AsyncStorageThemePreferenceDataSource();
    expect(await ds.getPreference()).toBe("system");
  });

  it("salva e recupera a preferência escolhida", async () => {
    const ds = new AsyncStorageThemePreferenceDataSource();
    await ds.setPreference("dark");
    expect(await ds.getPreference()).toBe("dark");
    expect(store.get(THEME_PREFERENCE_KEY)).toBe("dark");
  });

  it("retorna 'system' quando o valor salvo é inválido", async () => {
    store.set(THEME_PREFERENCE_KEY, "neon");
    const ds = new AsyncStorageThemePreferenceDataSource();
    expect(await ds.getPreference()).toBe("system");
  });
});
