import { Platform } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";
import { FavoriteButton } from "@/view/components/FavoriteButton";
import { SearchField } from "@/view/components/SearchField";
import { SortSheet } from "@/view/search/SortSheet";
import { FilterSheet } from "@/view/search/FilterSheet";
import * as HapticsModule from "@/view/haptics";
import type { SearchFilters } from "@/viewmodel/searchFilters";

jest.mock("@/di/container", () => {
  const actual = jest.requireActual("@/di/container");
  return {
    ...actual,
    makeFavoriteButtonViewModel: jest.fn(() => [
      { selected: false, loading: false, error: null },
      { toggle: jest.fn() },
    ]),
  };
});

describe("iOS Nativo — Fluxos 02 e 03: Descoberta e Busca (Spec 137, Issue #229)", () => {
  const originalPlatform = Platform.OS;
  let triggerHapticSpy: jest.SpyInstance;

  beforeEach(() => {
    triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
    triggerHapticSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("FavoriteButton — Feedback Tátil no iOS", () => {
    it("dispara triggerHaptic('selection') ao tocar no botão no iOS", async () => {
      Platform.OS = "ios";
      const { getByRole } = await render(
        <FavoriteButton bookId="book-1" userId="user-1" />
      );
      const button = getByRole("button");
      await act(async () => {
        fireEvent.press(button);
      });
      expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
    });

    it("não dispara triggerHaptic no Android ao tocar no botão", async () => {
      Platform.OS = "android";
      const { getByRole } = await render(
        <FavoriteButton bookId="book-1" userId="user-1" />
      );
      const button = getByRole("button");
      await act(async () => {
        fireEvent.press(button);
      });
      expect(triggerHapticSpy).not.toHaveBeenCalled();
    });
  });

  describe("SearchField — Padrão HIG e botão Cancelar no iOS", () => {
    it("no iOS exibe botão Cancelar quando há texto e onCancel é fornecido", async () => {
      Platform.OS = "ios";
      const onCancelMock = jest.fn();
      const onChangeMock = jest.fn();
      const { getByRole } = await render(
        <SearchField
          value="Machado de Assis"
          onChangeText={onChangeMock}
          onCancel={onCancelMock}
        />
      );
      const cancelButton = getByRole("button", { name: "Cancelar busca" });
      expect(cancelButton).toBeDefined();

      fireEvent.press(cancelButton);
      expect(triggerHapticSpy).toHaveBeenCalledWith("light");
      expect(onCancelMock).toHaveBeenCalled();
    });

    it("dispara triggerHaptic('light') ao limpar a busca no iOS", async () => {
      Platform.OS = "ios";
      const onChangeMock = jest.fn();
      const { getByRole } = await render(
        <SearchField
          value="Dom Casmurro"
          onChangeText={onChangeMock}
        />
      );
      const clearButton = getByRole("button", { name: "Limpar busca" });
      fireEvent.press(clearButton);
      expect(triggerHapticSpy).toHaveBeenCalledWith("light");
      expect(onChangeMock).toHaveBeenCalledWith("");
    });
  });

  describe("SortSheet — Ordenação com Haptic Feedback no iOS", () => {
    it("dispara triggerHaptic('selection') ao selecionar opção de ordenação no iOS", async () => {
      Platform.OS = "ios";
      const onSelectMock = jest.fn();
      const onCloseMock = jest.fn();
      const { getByRole } = await render(
        <SortSheet
          visible={true}
          selected="recent"
          onSelect={onSelectMock}
          onClose={onCloseMock}
        />
      );
      const radio = getByRole("radio", { name: "Menor preço" });
      fireEvent.press(radio);
      expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
      expect(onSelectMock).toHaveBeenCalledWith("price_asc");
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe("FilterSheet — Ações de Filtro com Haptic no iOS", () => {
    const defaultFilters: SearchFilters = {
      modality: "all",
      condition: "all",
      priceRange: "all",
      category: "all",
    };

    it("dispara triggerHaptic ao aplicar ou limpar filtros no iOS", async () => {
      Platform.OS = "ios";
      const onApplyMock = jest.fn();
      const onResetMock = jest.fn();
      const { getByRole } = await render(
        <FilterSheet
          visible={true}
          draftFilters={defaultFilters}
          sortBy="recent"
          availableCategories={["Literatura"]}
          resultCount={5}
          onChange={jest.fn()}
          onSortChange={jest.fn()}
          onApply={onApplyMock}
          onReset={onResetMock}
          onClose={jest.fn()}
        />
      );

      const applyBtn = getByRole("button", { name: "Mostrar 5 livros" });
      fireEvent.press(applyBtn);
      expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
      expect(onApplyMock).toHaveBeenCalled();

      const resetBtn = getByRole("button", { name: "Limpar filtros" });
      fireEvent.press(resetBtn);
      expect(triggerHapticSpy).toHaveBeenCalledWith("light");
      expect(onResetMock).toHaveBeenCalled();
    });
  });
});
