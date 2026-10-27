import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFound } from "@/view/components/NotFound";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

afterEach(async () => {
  await cleanup();
});

describe("NotFound (rota inexistente)", () => {
  it("explica em português e oferece voltar ao início ou explorar livros", async () => {
    const onGoHome = vi.fn();
    const onExplore = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <NotFound onGoHome={onGoHome} onExplore={onExplore} />
        </ThemeProvider>,
      );
    });

    expect(screen.getByText("Página não encontrada")).toBeDefined();
    fireEvent.press(screen.getByText("Ir para o início"));
    expect(onGoHome).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByText("Explorar livros"));
    expect(onExplore).toHaveBeenCalledTimes(1);
  });
});
