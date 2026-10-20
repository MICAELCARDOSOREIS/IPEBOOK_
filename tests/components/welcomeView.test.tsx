import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Welcome from "@/view/onboarding/welcome";

async function renderWelcome() {
  const onStart = vi.fn();
  const onSignIn = vi.fn();
  const onExplore = vi.fn();
  const screen = await render(<Welcome onStart={onStart} onSignIn={onSignIn} onExplore={onExplore} />);
  return { screen, onStart, onSignIn, onExplore };
}

describe("Boas-vindas do primeiro acesso (issue #98)", () => {
  it("apresenta a proposta e a região da beta", async () => {
    const { screen } = await renderWelcome();

    expect(screen.getByRole("header", { name: "Uma boa história" })).toBeTruthy();
    expect(screen.getByText("merece continuar.")).toBeTruthy();
    expect(screen.getByText("Livros de quem mora perto de você.")).toBeTruthy();
    expect(screen.getByLabelText("Beta exclusiva em Piripiri, PI")).toBeTruthy();
    expect(screen.getByLabelText("Modalidades: venda, troca e doação")).toBeTruthy();
  });

  it("encaminha cada ação para o destino correspondente", async () => {
    const { screen, onStart, onSignIn, onExplore } = await renderWelcome();

    fireEvent.press(screen.getByRole("button", { name: "Começar" }));
    fireEvent.press(screen.getByRole("button", { name: "Já tenho conta" }));
    fireEvent.press(screen.getByRole("button", { name: "Explorar livros sem entrar" }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(onExplore).toHaveBeenCalledTimes(1);
  });
});
