
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
  AsyncStorageThemePreferenceDataSource,
  THEME_PREFERENCE_KEY,
} from "@/infra/datasources/asyncStorageThemePreferenceDataSource";

describe("AsyncStorageThemePreferenceDataSource (Spec 054 / Issue #144)", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("retorna 'light' quando nada foi salvo ainda", async () => {
    const ds = new AsyncStorageThemePreferenceDataSource();
    expect(await ds.getPreference()).toBe("light");
  });

  it("salva e recupera a preferência escolhida", async () => {
    const ds = new AsyncStorageThemePreferenceDataSource();
    await ds.setPreference("dark");
    expect(await ds.getPreference()).toBe("dark");
    expect(mockStore.get(THEME_PREFERENCE_KEY)).toBe("dark");
  });

  it("retorna 'light' quando o valor salvo é inválido", async () => {
    mockStore.set(THEME_PREFERENCE_KEY, "neon");
    const ds = new AsyncStorageThemePreferenceDataSource();
    expect(await ds.getPreference()).toBe("light");
  });
});
