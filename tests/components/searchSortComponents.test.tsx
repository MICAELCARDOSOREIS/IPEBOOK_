import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { SortSheet } from "@/view/search/SortSheet";
import { FilterSheet } from "@/view/search/FilterSheet";
import { WebFilterSidebar } from "@/view/search/WebFilterSidebar";
import { DEFAULT_SEARCH_FILTERS, SORT_IDS, SORT_LABELS } from "@/viewmodel/searchFilters";

describe("Componentes de Ordenação Avançada (Spec 121, ADR 0095)", () => {
  it("SortSheet exibe as 5 opções de ordenação e aciona onSelect ao tocar", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const { getByText, getAllByRole } = await render(
      <ThemeProvider>
        <SortSheet visible selected="recent" onSelect={onSelect} onClose={onClose} />
      </ThemeProvider>,
    );

    // Confere que todas as 5 opções estão presentes
    for (const id of SORT_IDS) {
      expect(getByText(SORT_LABELS[id])).toBeTruthy();
    }

    const radios = getAllByRole("radio");
    expect(radios.length).toBe(5);

    // Toca em "Bairros de Piripiri"
    fireEvent.press(getByText("Bairros de Piripiri"));
    expect(onSelect).toHaveBeenCalledWith("neighborhood");
    expect(onClose).toHaveBeenCalled();
  });

  it("FilterSheet exibe os chips de ordenação e permite alterar a opção selecionada", async () => {
    const onSortChange = vi.fn();

    const { getByText } = await render(
      <ThemeProvider>
        <FilterSheet
          visible
          draftFilters={DEFAULT_SEARCH_FILTERS}
          sortBy="recent"
          availableCategories={["Ficção", "História"]}
          resultCount={10}
          onChange={vi.fn()}
          onSortChange={onSortChange}
          onApply={vi.fn()}
          onReset={vi.fn()}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(getByText("Ordenar por")).toBeTruthy();
    expect(getByText("Bairros de Piripiri")).toBeTruthy();
    expect(getByText("Menor preço")).toBeTruthy();
    expect(getByText("Maior preço")).toBeTruthy();

    fireEvent.press(getByText("Menor preço"));
    expect(onSortChange).toHaveBeenCalledWith("price_asc");
  });

  it("WebFilterSidebar exibe seção 'Ordenar por' e dispara onSortChange", async () => {
    const onSortChange = vi.fn();

    const { getByText } = await render(
      <ThemeProvider>
        <WebFilterSidebar
          filters={DEFAULT_SEARCH_FILTERS}
          categories={["Romance"]}
          hasActiveFilters={false}
          sortBy="recent"
          onSortChange={onSortChange}
          onModality={vi.fn()}
          onCondition={vi.fn()}
          onCategory={vi.fn()}
          onClear={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(getByText("Ordenar por")).toBeTruthy();
    const bairroChip = getByText("Bairros de Piripiri");
    expect(bairroChip).toBeTruthy();

    fireEvent.press(bairroChip);
    expect(onSortChange).toHaveBeenCalledWith("neighborhood");
  });
});
