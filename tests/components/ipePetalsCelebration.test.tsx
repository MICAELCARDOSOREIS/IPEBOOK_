import React from "react";
import { render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { IpePetalsCelebration } from "@/view/components/IpePetalsCelebration";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

describe("IpePetalsCelebration (Chuva de Pétalas de Ipê-Amarelo)", () => {
  it("renderiza sem interferir na acessibilidade (elementos ocultos)", async () => {
    const { getByTestId } = await render(
      <ThemeProvider>
        <IpePetalsCelebration testID="petals" />
      </ThemeProvider>,
    );
    const container = getByTestId("petals", { includeHiddenElements: true });
    expect(container).toBeDefined();
    expect(container.props.accessible).toBe(false);
  });

  it("não renderiza quando active é false", async () => {
    const { queryByTestId } = await render(
      <ThemeProvider>
        <IpePetalsCelebration active={false} testID="petals" />
      </ThemeProvider>,
    );
    expect(queryByTestId("petals", { includeHiddenElements: true })).toBeNull();
  });
});
