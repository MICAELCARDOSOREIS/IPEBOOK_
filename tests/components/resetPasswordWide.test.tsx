import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));
vi.mock("@/viewmodel/useResetPasswordViewModel", () => ({
  useResetPasswordViewModel: () => [
    { loading: false, error: null, success: false, linkExpired: false },
    { submit: vi.fn() },
  ],
}));

import ResetPassword from "@/view/auth/resetPassword";

describe("ResetPassword na Web Larga (Spec 093 · Figma 01.06)", () => {
  it("renderiza o painel da marca AuthShell no layout largo de duas colunas", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ResetPassword link="https://ipebook.app/redefinir-senha" />);
    });

    expect(screen.getByTestId("auth-shell")).toBeDefined();
    expect(screen.getByText("Histórias que seguem.")).toBeDefined();
    expect(screen.getByText("Um novo começo.")).toBeDefined();
    expect(screen.getByLabelText("Nova senha")).toBeDefined();
    expect(screen.getByLabelText("Confirmar senha")).toBeDefined();
  });
});
