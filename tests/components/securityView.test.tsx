import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import { Security } from "@/view/profile/security";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockAuth(user: AuthState["user"], options: { loading?: boolean; error?: string | null } = {}) {
  const requestPasswordReset = vi.fn().mockResolvedValue(true);
  mockedUseAuthViewModel.mockReturnValue([
    { user, loading: options.loading ?? false, error: options.error ?? null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset },
  ]);
  return { requestPasswordReset };
}

describe("tela de Segurança e verificação (Figma 07.06)", () => {
  it("mostra o e-mail da conta e envia o link de redefinição", async () => {
    const { requestPasswordReset } = mockAuth({ id: "ana", email: "ana@exemplo.com" });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Security onBack={() => {}} />);
    });

    expect(screen.getByText("ana@exemplo.com")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByText("Enviar link de redefinição"));
    });
    expect(requestPasswordReset).toHaveBeenCalledWith("ana@exemplo.com");
    expect(screen.getByText("Link enviado. Confira sua caixa de entrada (e o spam).")).toBeDefined();
  });

  it("volta ao tocar no botão de voltar da barra superior", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Security onBack={onBack} />);
    });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
