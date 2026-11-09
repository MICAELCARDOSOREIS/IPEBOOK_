import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";

describe("InlineErrorCard (Spec 131 / ADR 0102)", () => {
  it("renderiza o card de erro com acessibilidade e mensagem", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InlineErrorCard message="E-mail inválido para o cadastro." />);
    });
    const card = screen.getByTestId("inline-error-card");
    expect(card).toBeDefined();
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("E-mail inválido para o cadastro.")).toBeDefined();
  });

  it("não renderiza nada se a mensagem for vazia", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<InlineErrorCard message="" />);
    });
    expect(screen.queryByTestId("inline-error-card")).toBeNull();
  });
});
