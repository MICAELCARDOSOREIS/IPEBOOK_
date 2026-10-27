import React from "react";
import { render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import type { Book } from "@/model/entities/book";
import { CreateListingSuccess } from "@/view/listings/createListingSuccess";
import { MyListingsEmpty } from "@/view/listings/myListingsEmpty";

const book = (over: Partial<Book> = {}): Book => ({ id: "b", title: "Dom Casmurro", author: "Machado", ownerId: "u", modality: "sale", status: "available", ...over });

describe("ramos simples de telas de anúncio (Spec 092)", () => {
  it("anúncio publicado mostra o preço só quando existe", async () => {
    const withPrice = await render(<CreateListingSuccess published={book({ price: 25 })} />);
    expect(withPrice.getByText("R$ 25,00")).toBeDefined();
    const free = await render(<CreateListingSuccess published={book({ modality: "donation", price: undefined })} />);
    expect(free.getAllByText("Dom Casmurro").length).toBeGreaterThan(0);
  });

  it("estante vazia oferece 'Como funciona' só com o atalho", async () => {
    const without = await render(<MyListingsEmpty />);
    expect(without.queryByLabelText("Como funciona")).toBeNull();
    const withHelp = await render(<MyListingsEmpty onNavigateToHelp={() => {}} />);
    expect(withHelp.getByLabelText("Como funciona")).toBeDefined();
  });
});
