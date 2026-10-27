import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { Avatar } from "@/view/components/Avatar";

describe("Avatar (design-system/04-componentes/avatar.md, Spec 078)", () => {
  it("mostra o ipê da marca quando não há foto, sem iniciais", async () => {
    const { getByLabelText, getByTestId, queryByText } = await render(<Avatar name="Ana Paula Martins" />);
    expect(getByLabelText("Ana Paula Martins")).toBeDefined();
    expect(getByTestId("avatar-ipe", { includeHiddenElements: true })).toBeDefined();
    expect(queryByText("AP")).toBeNull();
  });

  it("mostra a imagem quando há foto", async () => {
    const { getByLabelText, queryByTestId } = await render(
      <Avatar name="Ana Paula" photoUrl="https://exemplo.com/foto.png" />,
    );
    expect(getByLabelText("Ana Paula")).toBeDefined();
    expect(queryByTestId("avatar-ipe", { includeHiddenElements: true })).toBeNull();
  });
});
