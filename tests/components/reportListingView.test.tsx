import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import ReportListing from "@/view/listings/reportListing";

describe("tela de denúncia de anúncio (ReportListing)", () => {
  it("exibe aviso de identificação necessária se o usuário não estiver logado", async () => {
    const onLogin = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <ReportListing
          listingId="book-1"
          listingTitle="O Cortiço"
          sessionUserId={null}
          onBack={() => {}}
          onNavigateToLogin={onLogin}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Identificação necessária" })).toBeDefined();
    expect(screen.getByText(/apenas pessoas autenticadas podem denunciar/)).toBeDefined();

    const loginButton = screen.getByRole("button", { name: "Entrar na minha conta" });
    await act(async () => {
      fireEvent.press(loginButton);
    });
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("renderiza opções de motivos e detalhes do livro quando logado", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <ReportListing
          listingId="book-1"
          listingTitle="O Cortiço"
          sessionUserId="user-1"
          onBack={() => {}}
        />,
      );
    });

    expect(screen.getByText("O Cortiço")).toBeDefined();
    expect(screen.getByText("O que aconteceu?")).toBeDefined();
    expect(screen.getByText("Sua denúncia é anônima. A equipe analisa em até 24 horas.")).toBeDefined();
    expect(screen.getByTestId("report-reasons-radiogroup")).toBeDefined();
    expect(screen.getByText("Conteúdo ofensivo")).toBeDefined();
    expect(screen.getByText("Golpe ou cobrança indevida")).toBeDefined();
    expect(screen.getByText("Cópia pirata ou ilegal")).toBeDefined();
    expect(screen.getByText("O livro não corresponde à descrição")).toBeDefined();
    expect(screen.getByText("Outro motivo")).toBeDefined();
  });

  it("permite selecionar um motivo e digitar detalhes", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <ReportListing
          listingId="book-1"
          listingTitle="Livro Teste"
          sessionUserId="user-1"
          onBack={() => {}}
        />,
      );
    });

    const scamOption = screen.getByLabelText("Golpe ou cobrança indevida");
    await act(async () => {
      fireEvent.press(scamOption);
    });

    const input = screen.getByLabelText("Detalhes adicionais da denúncia");
    await act(async () => {
      fireEvent.changeText(input, "Vendedor pediu transferência antecipada");
    });

    const submitBtn = screen.getByRole("button", { name: "Enviar denúncia" });
    expect(submitBtn).toBeDefined();
    expect(screen.getByTestId("report-reasons-radiogroup").props.accessibilityRole).toBe("radiogroup");
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("aciona callback onBack na barra superior", async () => {
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <ReportListing
          listingId="book-1"
          sessionUserId="user-1"
          onBack={onBack}
        />,
      );
    });

    const backButton = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backButton);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
