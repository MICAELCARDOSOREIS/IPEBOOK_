import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { IpeMark } from "@/view/components/IpeMark";
import { ReaderCard } from "@/view/components/ReaderCard";

describe("ReaderCard e IpeMark (Spec 078)", () => {
  it("mostra nome e linha de apoio com rótulo acessível (CA1)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReaderCard name="Ana Paula" subtitle="Centro, Piripiri" />);
    });
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("Centro, Piripiri")).toBeDefined();
    expect(screen.getByLabelText("Cartão de leitor de Ana Paula")).toBeDefined();
  });

  it("deixa o ipê fora da árvore de acessibilidade (CA2)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<IpeMark size={64} testID="ipe" />);
    });
    const mark = screen.getByTestId("ipe", { includeHiddenElements: true });
    expect(mark.props.accessible).toBe(false);
    expect(mark.props.importantForAccessibility).toBe("no-hide-descendants");
  });

  it("exibe a fase do ciclo do ipê quando informada", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ReaderCard name="Ana Paula" subtitle="Centro, Piripiri" cycleStage="Florada do Ipê" />);
    });
    expect(screen.getByText("Florada do Ipê")).toBeDefined();
  });
});
