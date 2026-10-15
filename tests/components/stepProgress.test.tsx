import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { StepProgress } from "@/view/components/StepProgress";

describe("StepProgress (design-system/04-componentes/indicador-de-etapas.md)", () => {
  it("anuncia a etapa atual e o nome da etapa em texto", async () => {
    const { getByText } = await render(
      <StepProgress currentStep={1} totalSteps={3} stepLabel="Livro" />,
    );
    expect(getByText("Etapa 1 de 3")).toBeDefined();
    expect(getByText("Livro")).toBeDefined();
  });

  it("preenchimento é proporcional a currentStep / totalSteps, não um terço fixo", async () => {
    const { getByTestId } = await render(
      <StepProgress currentStep={1} totalSteps={3} stepLabel="Livro" />,
    );
    const flatten = (style: unknown) => (Array.isArray(style) ? Object.assign({}, ...style) : style);
    const flex = flatten(getByTestId("step-progress-fill").props.style).flex;
    expect(flex).toBeCloseTo(1 / 3);
  });

  it("etapa final preenche a barra inteira", async () => {
    const { getByText } = await render(
      <StepProgress currentStep={3} totalSteps={3} stepLabel="Revisão" />,
    );
    expect(getByText("Etapa 3 de 3")).toBeDefined();
  });
});
