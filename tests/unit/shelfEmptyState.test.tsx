import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react-native";
import {
  ShelfEmptyState,
  MODALITY_LABEL,
  REQUEST_VERB,
  initials,
} from "@/view/listings/ShelfEmptyState";

describe("ShelfEmptyState e auxiliares", () => {
  it("extrai iniciais de nomes variados", () => {
    expect(initials("Douglas Adams")).toBe("DA");
    expect(initials("Machado")).toBe("M");
    expect(initials("  Guimarães   Rosa  ")).toBe("GR");
    expect(initials("")).toBe("");
  });

  it("mapeia rótulos e verbos de modalidade", () => {
    expect(MODALITY_LABEL.sale).toBe("Venda");
    expect(MODALITY_LABEL.trade).toBe("Troca");
    expect(MODALITY_LABEL.donation).toBe("Doação");

    expect(REQUEST_VERB.sale).toBe("quer comprar");
    expect(REQUEST_VERB.trade).toBe("quer trocar");
    expect(REQUEST_VERB.donation).toBe("quer receber");
  });

  it("renderiza título, corpo e aciona botão de ver anúncios", async () => {
    const onShow = vi.fn();
    const { getByText } = await render(
      <ShelfEmptyState
        icon="shelf"
        title="Nenhum livro"
        body="Sua estante está vazia"
        onShowListings={onShow}
      />
    );

    expect(getByText("Nenhum livro")).toBeDefined();
    expect(getByText("Sua estante está vazia")).toBeDefined();
    fireEvent.press(getByText("Ver meus anúncios"));
    expect(onShow).toHaveBeenCalledTimes(1);
  });
});
