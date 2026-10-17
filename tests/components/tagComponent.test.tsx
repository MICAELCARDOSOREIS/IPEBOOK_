import React from "react";
import { render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { Tag } from "@/view/components/Tag";

describe("Tag (Design System - ISO/IEC 25010 Usabilidade e Acessibilidade)", () => {
  it("renderiza etiqueta com rótulo padrão por modalidade e status", async () => {
    const screenSale = await render(<Tag variant="sale" />);
    expect(screenSale.getByText("Venda")).toBeDefined();

    const screenTrade = await render(<Tag variant="trade" />);
    expect(screenTrade.getByText("Troca")).toBeDefined();

    const screenDonation = await render(<Tag variant="donation" />);
    expect(screenDonation.getByText("Doação")).toBeDefined();

    const screenReserved = await render(<Tag variant="reserved" />);
    expect(screenReserved.getByText("Reservado")).toBeDefined();

    const screenCompleted = await render(<Tag variant="completed" />);
    expect(screenCompleted.getByText("Concluído")).toBeDefined();

    const screenPaused = await render(<Tag variant="paused" />);
    expect(screenPaused.getByText("Pausado")).toBeDefined();
  });

  it("aceita variantes em português", async () => {
    const screenVenda = await render(<Tag variant="venda" />);
    expect(screenVenda.getByText("Venda")).toBeDefined();

    const screenDoacao = await render(<Tag variant="doacao" />);
    expect(screenDoacao.getByText("Doação")).toBeDefined();
  });

  it("permite sobrescrever o texto do rótulo", async () => {
    const screen = await render(<Tag variant="sale" label="Preço Promocional" />);
    expect(screen.getByText("Preço Promocional")).toBeDefined();
  });

  it("possui acessibilidade com role text", async () => {
    const screen = await render(
      <Tag variant="donation" accessibilityLabel="Modalidade doação de livro" />,
    );
    expect(screen.getByLabelText("Modalidade doação de livro")).toBeDefined();
  });
});
