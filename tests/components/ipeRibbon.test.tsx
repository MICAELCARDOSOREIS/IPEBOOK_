import React from "react";
import { render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { IpeRibbon } from "@/view/components/IpeRibbon";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

describe("IpeRibbon (Marcador de Página Ipê-Amarelo)", () => {
  it("renderiza a fita marcadora com dimensões padrão", async () => {
    const { getByTestId } = await render(
      <ThemeProvider>
        <IpeRibbon />
      </ThemeProvider>,
    );
    const ribbon = getByTestId("ipe-ribbon", { includeHiddenElements: true });
    expect(ribbon).toBeDefined();
    expect(ribbon.props.accessible).toBe(false);
  });

  it("permite customizar dimensões da fita", async () => {
    const { getByTestId } = await render(
      <ThemeProvider>
        <IpeRibbon width={14} height={28} testID="custom-ribbon" />
      </ThemeProvider>,
    );
    const ribbon = getByTestId("custom-ribbon", { includeHiddenElements: true });
    expect(ribbon).toBeDefined();
  });
});
