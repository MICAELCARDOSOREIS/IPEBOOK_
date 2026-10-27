import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));

import Welcome from "@/view/onboarding/welcome";

describe("Boas-vindas na web larga: página que apresenta o app (Spec 092)", () => {
  it("mostra a chamada, as seções e leva Entrar e Criar conta aos destinos", async () => {
    const onStart = vi.fn();
    const onSignIn = vi.fn();
    const onHelp = vi.fn();
    const screen = await render(<Welcome onStart={onStart} onSignIn={onSignIn} onHelp={onHelp} onTerms={() => {}} />);
    expect(screen.getByText("merece continuar.")).toBeDefined();
    expect(screen.getByText("Como funciona")).toBeDefined();
    expect(screen.getByText("Pronto para dar nova vida a um livro?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Entrar")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Criar conta")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Já tenho conta")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Ajuda e perguntas frequentes")); });
    expect(onSignIn).toHaveBeenCalledTimes(2);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onHelp).toHaveBeenCalledTimes(1);
    // Regressão de segurança (Spec 092): sem botão de catálogo para visitantes.
    expect(screen.queryByLabelText(/Explorar/i)).toBeNull();
  });
});
