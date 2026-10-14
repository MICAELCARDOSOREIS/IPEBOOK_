import { describe, expect, it, vi } from "vitest";

vi.mock("expo-font", () => ({ useFonts: vi.fn((map: Record<string, unknown>) => [Object.keys(map).length > 0, null]) }));
vi.mock("@expo-google-fonts/source-serif-4", () => ({ SourceSerif4_700Bold: "mock-source-serif-4-bold" }));
vi.mock("@expo-google-fonts/roboto", () => ({
  Roboto_400Regular: "mock-roboto-regular",
  Roboto_500Medium: "mock-roboto-medium",
  Roboto_600SemiBold: "mock-roboto-semibold",
}));

describe("useIpebookFonts", () => {
  it("carrega a serifa da marca (ADR 0007) e os pesos de Roboto exigidos pela tipografia", async () => {
    const { useFonts } = await import("expo-font");
    const { useIpebookFonts, fontFamily } = await import("@/view/useIpebookFonts");

    const [loaded] = useIpebookFonts();

    expect(loaded).toBe(true);
    expect(useFonts).toHaveBeenCalledWith(
      expect.objectContaining({
        SourceSerif4_700Bold: "mock-source-serif-4-bold",
        Roboto_400Regular: "mock-roboto-regular",
        Roboto_500Medium: "mock-roboto-medium",
        Roboto_600SemiBold: "mock-roboto-semibold",
      }),
    );
    expect(fontFamily).toEqual({
      brand: "SourceSerif4_700Bold",
      regular: "Roboto_400Regular",
      medium: "Roboto_500Medium",
      semiBold: "Roboto_600SemiBold",
    });
  });
});
