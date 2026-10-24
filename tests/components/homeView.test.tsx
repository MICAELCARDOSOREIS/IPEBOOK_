import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/view/home";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderComponent(element: React.ReactElement) {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(element);
    mounted.push(renderer);
  });
  return {
    root: renderer.root,
    toJSON: () => renderer.toJSON(),
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((t) => t.unmount());
  });
});

describe("testes de componentes: Home View (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("renderiza cabeçalhos semânticos acessíveis para leitor de tela", async () => {
    const { root } = await renderComponent(<Home />);

    // Localiza cabeçalhos acessíveis por accessibilityRole="header"
    const headers = root.findAll(
      (node) => node.props.accessibilityRole === "header"
    );

    expect(headers.length).toBeGreaterThanOrEqual(2);
    const headerTexts = headers.map((h) => h.props.children);
    expect(headerTexts).toContain("Encontre sua próxima história.");
    expect(headerTexts).toContain("Perto de você");
  });

  it("exibe o subtítulo convidativo da manchete do Figma 02.01", async () => {
    const { root } = await renderComponent(<Home />);

    const subtitle = root.find(
      (node) =>
        node.props.children === "Compre, troque ou receba livros de quem mora perto de você."
    );
    expect(subtitle).toBeDefined();
  });

  it("renderiza estado visível de catálogo vazio quando não há livros", async () => {
    const { root } = await renderComponent(<Home />);

    // Verifica a mensagem amigável de catálogo vazio
    const emptyTitle = root.find(
      (node) => node.props.children === "Ainda não há livros por aqui."
    );
    const emptyBody = root.find(
      (node) =>
        node.props.children ===
        "Quando houver livros disponíveis, eles aparecerão neste espaço."
    );

    expect(emptyTitle).toBeDefined();
    expect(emptyBody).toBeDefined();
  });

  it("marca o detalhe visual estilizado como inacessível para evitar ruído no leitor de tela", async () => {
    const { root } = await renderComponent(<Home />);

    // Marca visual estilizada com accessible={false}
    const markNodes = root.findAll(
      (node) => node.props.accessible === false
    );
    expect(markNodes.length).toBeGreaterThanOrEqual(1);
  });

});
