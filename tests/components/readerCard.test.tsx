import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { IpeMark } from "@/view/components/IpeMark";
import { ReaderCard } from "@/view/components/ReaderCard";
import { readerCardNumber, readerCardSince } from "@/view/readerCardNumber";

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

  it("é uma carteirinha: título, número, desde, código de barras e foto (Spec 092)", async () => {
    const screen = await render(
      <ReaderCard
        name="Ana Paula"
        subtitle="Centro, Piripiri"
        photoUrl="https://cdn/ana.jpg"
        cardNumber="IPE 000123"
        memberSince="out/2026"
        footer={<></>}
      />,
    );
    expect(screen.getByText("Cartão de leitor")).toBeDefined();
    expect(screen.getByText("Biblioteca Comunitária de Piripiri")).toBeDefined();
    expect(screen.getByText("Leitor(a)")).toBeDefined();
    expect(screen.getByText("Nº do cartão")).toBeDefined();
    // O número do código de barras fica fora da árvore de acessibilidade para não repetir a leitura.
    expect(screen.getAllByText("IPE 000123").length).toBe(1);
    expect(screen.getAllByText("IPE 000123", { includeHiddenElements: true }).length).toBe(2);
    expect(screen.getByText("out/2026")).toBeDefined();
  });

  it("sem número, data nem foto mostra só o essencial, com o ipê na moldura (Spec 092)", async () => {
    const screen = await render(<ReaderCard name="Ana" subtitle="Piripiri" eyebrow="Assim aparece" />);
    expect(screen.getByText("Assim aparece")).toBeDefined();
    expect(screen.queryByText("Nº do cartão")).toBeNull();
    expect(screen.queryByText("Leitor desde")).toBeNull();
  });

  it("só número ou só data também aparecem (Spec 092)", async () => {
    const onlyNumber = await render(<ReaderCard name="Ana" subtitle="x" cardNumber="IPE 000001" />);
    expect(onlyNumber.getByText("Nº do cartão")).toBeDefined();
    expect(onlyNumber.queryByText("Leitor desde")).toBeNull();
    const onlySince = await render(<ReaderCard name="Ana" subtitle="x" memberSince="jan/2026" />);
    expect(onlySince.getByText("Leitor desde")).toBeDefined();
  });
});

describe("readerCardNumber e readerCardSince (Spec 092)", () => {
  it("o número é estável por conta e neutro sem id", () => {
    expect(readerCardNumber("b3dabd41-ae49")).toBe(readerCardNumber("b3dabd41-ae49"));
    expect(readerCardNumber("b3dabd41-ae49")).toMatch(/^IPE \d{6}$/);
    expect(readerCardNumber("outra-conta")).not.toBe(readerCardNumber("b3dabd41-ae49"));
    expect(readerCardNumber(null)).toBe("IPE 000000");
  });

  it("a data vira mês/ano e some quando inválida", () => {
    expect(readerCardSince("2026-10-27T12:00:00Z")).toMatch(/^[a-zç]{3,4}\/2026$/);
    expect(readerCardSince("não é data")).toBe("");
    expect(readerCardSince(undefined)).toBe("");
  });
});
