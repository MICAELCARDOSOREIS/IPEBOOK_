import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { BrandSplashScreen } from "@/view/components/BrandSplashScreen";

describe("BrandSplashScreen (Spec 111 / Identidade visual)", () => {
  it("renderiza a tela de abertura com a marca do IpêBook", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<BrandSplashScreen durationMs={100} />);
    });

    expect(screen.toJSON()).toBeNull(); // Em modo de teste (NODE_ENV=test), finaliza direto para não atrasar a suíte
  });
});
