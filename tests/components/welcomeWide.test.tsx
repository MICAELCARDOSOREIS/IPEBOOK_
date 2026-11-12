
import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import { colors } from "@/view/tokens";

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

  it("aplica as cores canônicas da marca nos cartões de Venda, Troca e Doação (ADR 0104)", async () => {
    const screen = await render(<Welcome onStart={vi.fn()} onSignIn={vi.fn()} />);
    const vendaTitle = screen.getByText("Venda");
    const trocaTitle = screen.getByText("Troca");
    const doacaoTitle = screen.getByText("Doação");

    expect(StyleSheet.flatten(vendaTitle.props.style).color).toBe(colors.badge.sale.text);
    expect(StyleSheet.flatten(trocaTitle.props.style).color).toBe(colors.badge.trade.text);
    expect(StyleSheet.flatten(doacaoTitle.props.style).color).toBe(colors.badge.donation.text);
  });
});

describe("Boas-vindas no site como convite do beta (Spec 108)", () => {
  it("troca Entrar e Criar conta pelo teste do app e oculta Ver na Play Store na Home", async () => {
    const onStart = vi.fn();
    const onSignIn = vi.fn();
    const screen = await render(<Welcome betaInvite onStart={onStart} onSignIn={onSignIn} onTerms={() => {}} />);
    expect(screen.queryByLabelText("Entrar")).toBeNull();
    expect(screen.queryByLabelText("Criar conta")).toBeNull();
    expect(screen.queryByLabelText("Já tenho conta")).toBeNull();
    expect(screen.queryByText("Criar conta")).toBeNull();
    expect(screen.queryByLabelText("Ver na Play Store")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByLabelText("Quero testar")); });
    for (const botao of screen.getAllByLabelText("Quero testar o app")) {
      await act(async () => { fireEvent.press(botao); });
    }
    expect(onStart).toHaveBeenCalledTimes(3);
    expect(onSignIn).not.toHaveBeenCalled();
  });
});
