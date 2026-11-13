
import { act, fireEvent, render } from "@testing-library/react-native";
import { Share } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { CreateListingSuccess } from "@/view/listings/createListingSuccess";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";

vi.mock("expo-linking", () => ({
  createURL: vi.fn((path: string) => `https://ipebook.app${path}`),
  openURL: vi.fn().mockResolvedValue(undefined),
}));

const book = (over: Partial<Book> = {}): Book => ({ id: "b", title: "Dom Casmurro", author: "Machado", ownerId: "u", modality: "sale", status: "available", ...over });

describe("ramos simples de telas de anúncio (Spec 092)", () => {
  it("anúncio publicado mostra o preço só quando existe", async () => {
    const withPrice = await render(<CreateListingSuccess published={book({ price: 25 })} />);
    expect(withPrice.getByText("R$ 25,00")).toBeDefined();
    expect(withPrice.getByLabelText("Divulgar no WhatsApp")).toBeDefined();
    expect(withPrice.getByLabelText("Compartilhar anúncio")).toBeDefined();
    const free = await render(<CreateListingSuccess published={book({ modality: "donation", price: undefined })} />);
    expect(free.getAllByText("Dom Casmurro").length).toBeGreaterThan(0);
  });

  it("mostra o erro quando o compartilhamento no WhatsApp falha logo após publicar (Spec 118)", async () => {
    const linking = await import("expo-linking");
    vi.mocked(linking.openURL).mockRejectedValueOnce(new Error("sem WhatsApp"));
    const shareSpy = vi.spyOn(Share, "share").mockRejectedValueOnce(new Error("folha indisponível"));
    const screen = await render(<CreateListingSuccess published={book()} />);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Divulgar no WhatsApp"));
    });

    expect(screen.getByText("Não foi possível compartilhar o anúncio. Tente novamente.")).toBeDefined();
    shareSpy.mockRestore();
  });

  it("estante vazia oferece 'Como funciona' só com o atalho", async () => {
    const without = await render(<MyListingsEmpty />);
    expect(without.queryByLabelText("Como funciona")).toBeNull();
    const withHelp = await render(<MyListingsEmpty onNavigateToHelp={() => {}} />);
    expect(withHelp.getByLabelText("Como funciona")).toBeDefined();
  });
});
