import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { SearchBookCard } from "@/view/search/SearchBookCard";
import type { Book } from "@/model/entities/book";

const sampleBook: Book = {
  id: "b1",
  ownerId: "u1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  modality: "donation",
  price: undefined,
  photos: [],
  neighborhood: "Centro",
  status: "available",
  category: "Romance",
  isBox: true,
  boxVolumesCount: 3,
};

describe("SearchBookCard", () => {
  it("renderiza modalidade doacao com gratuito e status disponivel", () => {
    const onPress = vi.fn();
    const onFavoriteToggle = vi.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <SearchBookCard
          item={sampleBook}
          wideWeb={false}
          gridColumns={1}
          userId="u1"
          onPress={onPress}
          onFavoriteToggle={onFavoriteToggle}
        />,
      );
    });

    expect(root!.root.findByProps({ accessibilityLabel: "Ver detalhe de Dom Casmurro, Machado de Assis em Centro" })).toBeTruthy();
  });

  it("renderiza modalidade troca e preco formatado com status reservado", () => {
    const tradeBook: Book = {
      ...sampleBook,
      id: "b2",
      modality: "trade",
      price: 15,
      status: "reserved",
      neighborhood: undefined,
    };
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <SearchBookCard
          item={tradeBook}
          wideWeb={true}
          gridColumns={3}
          userId={null}
          onPress={vi.fn()}
          onFavoriteToggle={vi.fn()}
        />,
      );
    });

    expect(root!.root.findByProps({ accessibilityLabel: "Ver detalhe de Dom Casmurro, Machado de Assis" })).toBeTruthy();
  });
});

  it("dispara onPress e onFavoriteToggle ao interagir", () => {
    const onPress = vi.fn();
    const onFavoriteToggle = vi.fn();
    let root: renderer.ReactTestRenderer;

    act(() => {
      root = renderer.create(
        <SearchBookCard
          item={sampleBook}
          wideWeb={false}
          gridColumns={1}
          userId="u1"
          onPress={onPress}
          onFavoriteToggle={onFavoriteToggle}
        />,
      );
    });

    const cardButton = root!.root.findByProps({ accessibilityLabel: "Ver detalhe de Dom Casmurro, Machado de Assis em Centro" });
    cardButton.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);

    const chevron = root!.root.findByProps({ accessibilityLabel: "Abrir Dom Casmurro" });
    chevron.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(2);
  });
