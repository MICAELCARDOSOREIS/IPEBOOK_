import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { ShelfTabSheet, type ShelfTabOption } from "@/view/listings/ShelfTabSheet";

describe("ShelfTabSheet (Estante · Seletor estilo Explorar)", () => {
  const options: ShelfTabOption[] = [
    { key: "listings", label: "Anúncios" },
    { key: "proposals", label: "Propostas", badge: 3 },
    { key: "concluded", label: "Concluídos" },
  ];

  it("renderiza o cabeçalho e as 3 opções com rádio", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const { getByText, getAllByRole } = await render(
      <ThemeProvider>
        <ShelfTabSheet
          visible
          selected="listings"
          options={options}
          onSelect={onSelect}
          onClose={onClose}
        />
      </ThemeProvider>,
    );

    expect(getByText("Exibir na estante")).toBeTruthy();
    expect(getByText("Anúncios")).toBeTruthy();
    expect(getByText("Propostas")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("Concluídos")).toBeTruthy();

    const radios = getAllByRole("radio");
    expect(radios.length).toBe(3);
  });

  it("aciona onSelect e onClose ao selecionar uma opção", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    const { getByLabelText } = await render(
      <ThemeProvider>
        <ShelfTabSheet
          visible
          selected="listings"
          options={options}
          onSelect={onSelect}
          onClose={onClose}
        />
      </ThemeProvider>,
    );

    fireEvent.press(getByLabelText("Propostas, 3 em aberto"));
    expect(onSelect).toHaveBeenCalledWith("proposals");
    expect(onClose).toHaveBeenCalled();
  });
});
