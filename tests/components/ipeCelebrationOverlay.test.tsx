
import { View } from "react-native";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { IpeCelebrationOverlay } from "@/view/components/IpeCelebrationOverlay";
import {
  checkAndTriggerInitialPetals,
  resetAppLaunchCelebrationForTesting,
  triggerIpePetals,
} from "@/view/components/ipeCelebrationController";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

vi.mock("@/view/components/IpePetalsCelebration", () => ({
  IpePetalsCelebration: ({ testID, variant }: any) => <View testID={`${testID}-${variant}`} />,
}));

describe("IpeCelebrationOverlay (Overlay de florada sobre Tab Bar e telas)", () => {
  it("usa uma queda suave na entrada e a florada completa no disparo manual", async () => {
    resetAppLaunchCelebrationForTesting();
    const screen = await render(
      <ThemeProvider>
        <IpeCelebrationOverlay />
      </ThemeProvider>,
    );

    // Inicialmente não renderiza nada
    expect(screen.queryByTestId("ipe-celebration-overlay", { includeHiddenElements: true })).toBeNull();

    // A primeira entrada usa a variação breve.
    await act(async () => {
      checkAndTriggerInitialPetals();
    });
    expect(screen.getByTestId("ipe-celebration-overlay-entry")).toBeDefined();

    // O toque manual continua usando a florada completa.
    await act(async () => {
      triggerIpePetals();
    });
    expect(screen.getByTestId("ipe-celebration-overlay-celebration")).toBeDefined();
  });
});
