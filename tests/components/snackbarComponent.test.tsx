import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { Snackbar } from "@/view/components/Snackbar";

describe("Snackbar (Design System - ISO/IEC 25010 Usabilidade e Acessibilidade)", () => {
  it("não renderiza nada quando visible for false", async () => {
    const screen = await render(
      <Snackbar visible={false} message="Anúncio publicado" />,
    );
    expect(screen.queryByText("Anúncio publicado")).toBeNull();
  });

  it("renderiza mensagem com região acessível de alerta quando visible for true", async () => {
    const screen = await render(
      <Snackbar visible={true} message="Anúncio publicado com sucesso" />,
    );
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Anúncio publicado com sucesso")).toBeDefined();
  });

  it("renderiza botão de ação e dispara onAction ao ser pressionado", async () => {
    const onAction = vi.fn();
    const screen = await render(
      <Snackbar
        visible={true}
        message="Anúncio removido"
        actionLabel="Desfazer"
        onAction={onAction}
      />,
    );

    const actionButton = screen.getByRole("button", { name: "Desfazer" });
    fireEvent.press(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("chama onDismiss após a duração especificada", async () => {
    vi.useFakeTimers();
    try {
      const onDismiss = vi.fn();
      await render(
        <Snackbar
          visible={true}
          message="Aviso temporário"
          duration={3000}
          onDismiss={onDismiss}
        />,
      );

      expect(onDismiss).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
