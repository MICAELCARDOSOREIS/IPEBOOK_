import { describe, expect, it, vi } from "vitest";

vi.mock("expo-font", () => ({ useFonts: vi.fn((map: Record<string, unknown>) => [Object.keys(map).length > 0, null]) }));
vi.mock("@expo-google-fonts/source-serif-4", () => ({ SourceSerif4_700Bold: "mock-source-serif-4-bold" }));
vi.mock("@expo-google-fonts/plus-jakarta-sans", () => ({
  PlusJakartaSans_400Regular: "mock-plus-jakarta-sans-regular",
  PlusJakartaSans_500Medium: "mock-plus-jakarta-sans-medium",
  PlusJakartaSans_600SemiBold: "mock-plus-jakarta-sans-semibold",
}));

describe("useIpebookFonts", () => {
  it("carrega a serifa da marca (ADR 0007) e os pesos de Plus Jakarta Sans exigidos pela tipografia (ADR 0107)", async () => {
    const { useFonts } = await import("expo-font");
    const { useIpebookFonts, fontFamily } = await import("@/view/useIpebookFonts");

    const [loaded] = useIpebookFonts();

    expect(loaded).toBe(true);
    expect(useFonts).toHaveBeenCalledWith(
      expect.objectContaining({
        SourceSerif4_700Bold: "mock-source-serif-4-bold",
        PlusJakartaSans_400Regular: "mock-plus-jakarta-sans-regular",
        PlusJakartaSans_500Medium: "mock-plus-jakarta-sans-medium",
        PlusJakartaSans_600SemiBold: "mock-plus-jakarta-sans-semibold",
      }),
    );
    expect(fontFamily).toEqual({
      brand: "SourceSerif4_700Bold",
      regular: "PlusJakartaSans_400Regular",
      medium: "PlusJakartaSans_500Medium",
      semiBold: "PlusJakartaSans_600SemiBold",
    });
  });
});
