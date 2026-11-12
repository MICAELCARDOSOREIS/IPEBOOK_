
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import Welcome from "@/view/onboarding/welcome";

async function renderWelcome(props?: { onHelp?: () => void; onTerms?: () => void }) {
  const onStart = vi.fn();
  const onSignIn = vi.fn();
  const screen = await render(
    <Welcome onStart={onStart} onSignIn={onSignIn} onHelp={props?.onHelp} onTerms={props?.onTerms} />,
  );
  return { screen, onStart, onSignIn };
}

describe("Boas-vindas do primeiro acesso (issue #98)", () => {
  it("apresenta a proposta e a região da beta", async () => {
    const { screen } = await renderWelcome();

    expect(screen.getByRole("header", { name: "Uma boa história" })).toBeTruthy();
    expect(screen.getByText("merece continuar.")).toBeTruthy();
    expect(screen.getByText("Livros de quem mora perto de você.")).toBeTruthy();
    expect(screen.getByLabelText("Beta exclusiva em Piripiri, PI")).toBeTruthy();
    expect(screen.getByLabelText("Modalidades: venda, troca e doação")).toBeTruthy();
    expect(screen.getByLabelText("Encontros em locais públicos de Piripiri sem taxas")).toBeTruthy();
  });

  it("permite interagir com as modalidades para ver detalhes de cada uma", async () => {
    const { screen } = await renderWelcome();

    const trocaChip = screen.getByRole("button", { name: "Troca: toque para ver detalhes" });
    await act(async () => {
      fireEvent.press(trocaChip);
    });

    expect(
      screen.getByText("Ofereça um livro da sua estante e combine a troca sem intermediários."),
    ).toBeTruthy();

    // Toque novamente fecha a explicação
    await act(async () => {
      fireEvent.press(trocaChip);
    });
    expect(
      screen.queryByText("Ofereça um livro da sua estante e combine a troca sem intermediários."),
    ).toBeNull();
  });

  it("renderiza links institucionais de ajuda e termos quando fornecidos", async () => {
    const onHelp = vi.fn();
    const onTerms = vi.fn();
    const { screen } = await renderWelcome({ onHelp, onTerms });

    const helpLink = screen.getByRole("link", { name: "Como funciona o IpêBook" });
    const termsLink = screen.getByRole("link", { name: "Termos de uso" });

    await act(async () => {
      fireEvent.press(helpLink);
      fireEvent.press(termsLink);
    });

    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onTerms).toHaveBeenCalledTimes(1);
  });

  it("encaminha cada ação para o destino correspondente e não oferece catálogo sem conta", async () => {
    const { screen, onStart, onSignIn } = await renderWelcome();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Começar" }));
      fireEvent.press(screen.getByRole("button", { name: "Já tenho conta" }));
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onSignIn).toHaveBeenCalledTimes(1);
    // Regressão de segurança (Spec 092): não há mais acesso de visitante ao catálogo.
    expect(screen.queryByRole("button", { name: /Explorar/i })).toBeNull();
  });
});
