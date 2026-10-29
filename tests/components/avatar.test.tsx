import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { Avatar } from "@/view/components/Avatar";

describe("Avatar (design-system/04-componentes/avatar.md)", () => {
  it("mostra as iniciais do nome quando não há foto", async () => {
    const { getByText, getByLabelText } = await render(<Avatar name="Ana Paula Martins" />);
    expect(getByText("AP")).toBeDefined();
    expect(getByLabelText("Ana Paula Martins")).toBeDefined();
  });

  it("mostra a imagem quando há foto", async () => {
    const { getByLabelText, queryByText } = await render(
      <Avatar name="Ana Paula" photoUrl="https://exemplo.com/foto.png" />,
    );
    expect(getByLabelText("Ana Paula")).toBeDefined();
    expect(queryByText("AP")).toBeNull();
  });

  it("gera iniciais a partir de um único nome", async () => {
    const { getByText } = await render(<Avatar name="Ana" />);
    expect(getByText("A")).toBeDefined();
  });
});
