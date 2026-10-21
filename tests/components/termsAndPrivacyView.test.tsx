import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

describe("tela de Termos e Privacidade (ISO/IEC 25010 - Usabilidade e Conformidade)", () => {
  it("renderiza cabeçalho acessível", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByRole("header", { name: "Termos e privacidade" })).toBeDefined();
  });

  it("inicia na aba de Termos de Uso com menção a Piripiri e segurança", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByText("1. Finalidade da Comunidade")).toBeDefined();
    expect(screen.getByText(/cidade de Piripiri, PI/)).toBeDefined();
    expect(screen.getByText("4. Encontros Presenciais e Segurança")).toBeDefined();
  });

  it("agrupa as abas de Termos/Privacidade em um contêiner com papel tablist", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByTestId("terms-privacy-tablist").props.accessibilityRole).toBe("tablist");
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("permite alternar para a aba de Privacidade e exibe conformidade com LGPD", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    const privacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });
    await act(async () => {
      fireEvent.press(privacyTab);
    });

    expect(screen.getByText("1. Tratamento de Dados Pessoais (LGPD)")).toBeDefined();
    expect(screen.getByText(/Lei Geral de Proteção de Dados/)).toBeDefined();
    expect(screen.getByText("2. Sigilo e Visibilidade das Contas")).toBeDefined();
  });

  it("aciona callback onBack ao pressionar botão de retorno", async () => {
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={onBack} />);
    });

    const backButton = screen.getByRole("button", { name: "Voltar" });
    fireEvent.press(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("aciona callback onNavigateToDeleteAccount na aba de privacidade", async () => {
    const onDelete = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <TermsAndPrivacy onBack={() => {}} onNavigateToDeleteAccount={onDelete} />,
      );
    });

    const privacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });
    await act(async () => {
      fireEvent.press(privacyTab);
    });

    expect(screen.getByText("Portabilidade e Exclusão (LGPD — Art. 18)")).toBeDefined();
    const deleteLink = screen.getByRole("button", {
      name: "Solicitar exclusão da minha conta e dados",
    });
    await act(async () => {
      fireEvent.press(deleteLink);
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
