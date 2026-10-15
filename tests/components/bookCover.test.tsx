import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { BookCover } from "@/view/components/BookCover";

describe("BookCover (design-system/04-componentes/capa-ilustrativa.md)", () => {
  it("usa o título como texto alternativo acessível", async () => {
    const { getByLabelText } = await render(<BookCover id="a1" title="Dom Casmurro" />);
    expect(getByLabelText("Capa ilustrativa de Dom Casmurro")).toBeDefined();
  });

  it("gera a mesma cor para o mesmo id (determinístico, não aleatório)", async () => {
    const { getByLabelText: getFirst } = await render(<BookCover id="mesmo-id" title="Livro A" />);
    const { getByLabelText: getSecond } = await render(<BookCover id="mesmo-id" title="Livro B" />);
    const firstStyle = getFirst("Capa ilustrativa de Livro A").props.style;
    const secondStyle = getSecond("Capa ilustrativa de Livro B").props.style;
    const flatten = (style: unknown) => (Array.isArray(style) ? Object.assign({}, ...style) : style);
    expect(flatten(firstStyle).backgroundColor).toBe(flatten(secondStyle).backgroundColor);
  });

  it("variante em lista (44px) não sobrepõe texto sobre a arte", async () => {
    const { queryByText } = await render(<BookCover id="a1" title="Dom Casmurro" variant="list" />);
    expect(queryByText("Dom Casmurro")).toBeNull();
  });

  it("variante em cartão (≥80px) sobrepõe título e autor", async () => {
    const { getByText } = await render(
      <BookCover id="a1" title="Dom Casmurro" author="Machado de Assis" variant="card" />,
    );
    expect(getByText("Dom Casmurro")).toBeDefined();
    expect(getByText("Machado de Assis")).toBeDefined();
  });
});
