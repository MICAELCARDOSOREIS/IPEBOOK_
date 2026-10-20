import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { LoadingState } from "@/view/components/LoadingState";
import { ErrorState } from "@/view/components/ErrorState";
import { OfflineState } from "@/view/components/OfflineState";

describe("LoadingState (design-system/04-componentes/estados-do-sistema.md, Issue #76)", () => {
  it("anuncia o rótulo padrão para leitor de tela e mostra o texto com reticências", async () => {
    const { getByLabelText, getByText } = await render(<LoadingState />);
    expect(getByLabelText("Carregando")).toBeDefined();
    expect(getByText("Carregando…")).toBeDefined();
  });

  it("aceita um rótulo customizado por tela", async () => {
    const { getByLabelText, getByText } = await render(<LoadingState label="Carregando livros" />);
    expect(getByLabelText("Carregando livros")).toBeDefined();
    expect(getByText("Carregando livros…")).toBeDefined();
  });
});

describe("ErrorState (design-system/04-componentes/estados-do-sistema.md, Issue #76)", () => {
  it("mostra a mensagem como alert e aciona onRetry ao tocar em Tentar novamente", async () => {
    const onRetry = vi.fn();
    const { getByRole, getByText } = await render(
      <ErrorState message="Não foi possível carregar os livros." onRetry={onRetry} />,
    );
    expect(getByRole("alert").props.children).toBe("Não foi possível carregar os livros.");
    fireEvent.press(getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("aceita um rótulo de ação customizado", async () => {
    const { getByRole } = await render(
      <ErrorState message="Erro" onRetry={() => {}} retryLabel="Recarregar" />,
    );
    expect(getByRole("button", { name: "Recarregar" })).toBeDefined();
  });
});

describe("OfflineState (design-system/04-componentes/estados-do-sistema.md, Issue #76)", () => {
  it("mostra a mensagem padrão de sem conexão e aciona onRetry", async () => {
    const onRetry = vi.fn();
    const { getByRole } = await render(<OfflineState onRetry={onRetry} />);
    expect(getByRole("alert").props.children).toBe("Você está sem conexão com a internet.");
    fireEvent.press(getByRole("button", { name: "Tentar novamente" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("aceita mensagem e rótulo de ação customizados", async () => {
    const { getByRole } = await render(
      <OfflineState onRetry={() => {}} message="Sem internet no momento." retryLabel="Tentar de novo" />,
    );
    expect(getByRole("alert").props.children).toBe("Sem internet no momento.");
    expect(getByRole("button", { name: "Tentar de novo" })).toBeDefined();
  });
});
