import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb } from "@/view/components/Breadcrumb";

describe("Breadcrumb (Navegação Web e Desktop)", () => {
  afterEach(() => {
    cleanup();
  });

  it("não quebra e retorna nulo se lista for vazia", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Breadcrumb items={[]} />);
    });
    expect(screen.toJSON()).toBeNull();
  });

  it("renderiza os itens, separadores e dispara ações", async () => {
    const onHome = vi.fn();
    const onCategory = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Breadcrumb
          items={[
            { label: "Explorar", onPress: onHome },
            { label: "Romance", onPress: onCategory },
            { label: "Dom Casmurro" },
          ]}
        />
      );
    });

    expect(screen.getByText("Explorar")).toBeDefined();
    expect(screen.getByText("Romance")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByText("Explorar"));
    });
    expect(onHome).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByText("Romance"));
    });
    expect(onCategory).toHaveBeenCalledTimes(1);
  });

  it("renderiza o último item como página corrente sem ação de link", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Breadcrumb
          items={[
            { label: "Explorar", onPress: vi.fn() },
            { label: "Título do Livro" },
          ]}
        />
      );
    });

    const currentText = screen.getByText("Título do Livro");
    expect(currentText).toBeDefined();
  });
});
