import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { ListingShareCard } from "@/view/components/ListingShareCard";

const book = { id: "b1", title: "Dom Casmurro", author: "Machado de Assis", modality: "sale" as const, price: 25, neighborhood: "Centro", photoUrl: "https://cdn/capa.jpg" };

describe("ListingShareCard (Spec 092)", () => {
  it("mostra título, autor, preço, bairro e o endereço por escrito, e avisa quando a capa carrega", async () => {
    const onCoverSettled = vi.fn();
    const screen = await render(<ListingShareCard book={book} url="https://ipebook.app/livro/b1" onCoverSettled={onCoverSettled} />);
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Machado de Assis")).toBeDefined();
    expect(screen.getByText("Venda")).toBeDefined();
    expect(screen.getByText("R$ 25,00")).toBeDefined();
    expect(screen.getByText("Centro, Piripiri")).toBeDefined();
    expect(screen.getByText("ipebook.app/livro/b1")).toBeDefined();
    // A capa é uma <Image>; ao terminar de carregar, avisa quem vai capturar o cartão.
    const cover = screen.toJSON() as { children?: unknown[] } | null;
    expect(cover).not.toBeNull();
    expect(onCoverSettled).not.toHaveBeenCalled();
  });

  it("sem foto usa a inicial; troca e doação mostram a oferta certa; sem bairro não mostra local", async () => {
    const trade = await render(<ListingShareCard book={{ ...book, photoUrl: undefined, modality: "trade", neighborhood: undefined }} url="https://ipebook.app/livro/b1" />);
    expect(trade.getByText("D")).toBeDefined();
    expect(trade.getByText("Aceita troca")).toBeDefined();
    expect(trade.queryByText("Centro, Piripiri")).toBeNull();
    const donation = await render(<ListingShareCard book={{ ...book, modality: "donation", price: undefined }} url="https://ipebook.app/livro/b2" />);
    expect(donation.getByText("Gratuito")).toBeDefined();
    await act(async () => { fireEvent(donation.getByText("Gratuito"), "layout"); });
  });
});
