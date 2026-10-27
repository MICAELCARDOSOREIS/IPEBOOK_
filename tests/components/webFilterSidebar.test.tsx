import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebFilterSidebar } from "@/view/search/WebFilterSidebar";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { DEFAULT_SEARCH_FILTERS } from "@/viewmodel/searchFilters";

afterEach(async () => {
  await cleanup();
});

async function wrap(node: React.ReactElement) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<ThemeProvider>{node}</ThemeProvider>);
  });
  return screen;
}

describe("WebFilterSidebar (Figma 34:229)", () => {
  const base = {
    filters: DEFAULT_SEARCH_FILTERS,
    categories: ["Literatura", "Infantil"],
    hasActiveFilters: false,
    onModality: vi.fn(),
    onCondition: vi.fn(),
    onCategory: vi.fn(),
    onClear: vi.fn(),
  };

  it("aplica filtros na hora, alterna de volta e só oferece limpar com filtro ativo", async () => {
    const onModality = vi.fn();
    const onCondition = vi.fn();
    const onCategory = vi.fn();
    const screen = await wrap(
      <WebFilterSidebar
        {...base}
        filters={{ ...DEFAULT_SEARCH_FILTERS, category: "Literatura" }}
        onModality={onModality}
        onCondition={onCondition}
        onCategory={onCategory}
      />,
    );

    fireEvent.press(screen.getByLabelText("Filtrar por Troca"));
    expect(onModality).toHaveBeenCalledWith("trade");
    fireEvent.press(screen.getByLabelText("Bom estado"));
    expect(onCondition).toHaveBeenCalledWith("good");
    fireEvent.press(screen.getByLabelText("Novo"));
    expect(onCondition).toHaveBeenCalledWith("new");
    fireEvent.press(screen.getByLabelText("Com marcas"));
    expect(onCondition).toHaveBeenCalledWith("marked");
    fireEvent.press(screen.getByLabelText("Desgastado"));
    expect(onCondition).toHaveBeenCalledWith("worn");
    fireEvent.press(screen.getByLabelText("Infantil"));
    expect(onCategory).toHaveBeenCalledWith("Infantil");
    // Literatura já está marcada: tocar de novo desmarca.
    fireEvent.press(screen.getByLabelText("Literatura"));
    expect(onCategory).toHaveBeenCalledWith("all");

    // "Limpar filtros" só aparece com filtro ativo.
    expect(screen.queryByLabelText("Limpar todos os filtros de busca")).toBeNull();
    const onClear = vi.fn();
    await act(async () => {
      screen.rerender(
        <ThemeProvider>
          <WebFilterSidebar {...base} hasActiveFilters onClear={onClear} />
        </ThemeProvider>,
      );
    });
    fireEvent.press(screen.getByLabelText("Limpar todos os filtros de busca"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
