import React from "react";
import { View } from "react-native";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { IpeCelebrationOverlay } from "@/view/components/IpeCelebrationOverlay";
import { triggerIpePetals } from "@/view/components/ipeCelebrationController";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

vi.mock("@/view/components/IpePetalsCelebration", () => ({
  IpePetalsCelebration: ({ testID }: any) => <View testID={testID} />,
}));

describe("IpeCelebrationOverlay (Overlay de florada sobre Tab Bar e telas)", () => {
  it("permanece inativo até que a florada seja disparada", async () => {
    const screen = await render(
      <ThemeProvider>
        <IpeCelebrationOverlay />
      </ThemeProvider>,
    );

    // Inicialmente não renderiza nada
    expect(screen.queryByTestId("ipe-celebration-overlay", { includeHiddenElements: true })).toBeNull();

    // Dispara a florada
    await act(async () => {
      triggerIpePetals();
    });

    // Torna-se ativo
    expect(screen.getByTestId("ipe-celebration-overlay", { includeHiddenElements: true })).toBeDefined();
  });
});
