import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import CreateListingScreen from "@/view/listings/createListingScreen";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

const noopAuthActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };

describe("gate de sessão da tela de cadastro de anúncio (FR-006)", () => {
  it("redireciona para entrar quando não há sessão autenticada", async () => {
    mockedUseAuthViewModel.mockReturnValue([{ user: null, loading: false, error: null }, noopAuthActions]);
    const onRequireSignIn = vi.fn();

    await act(async () => {
      render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
    });

    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });

  it("renderiza o formulário de anúncio quando autenticado", async () => {
    const authState: AuthState = { user: { id: "1", email: "pessoa@exemplo.com" }, loading: false, error: null };
    mockedUseAuthViewModel.mockReturnValue([authState, noopAuthActions]);
    const onRequireSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
    });

    expect(screen.getByText("Anunciar livro")).toBeDefined();
    expect(onRequireSignIn).not.toHaveBeenCalled();
  });

  it("não renderiza nem redireciona enquanto a sessão está carregando", async () => {
    mockedUseAuthViewModel.mockReturnValue([{ user: null, loading: true, error: null }, noopAuthActions]);
    const onRequireSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListingScreen onRequireSignIn={onRequireSignIn} />);
    });

    expect(screen.queryByText("Anunciar livro")).toBeNull();
    expect(onRequireSignIn).not.toHaveBeenCalled();
  });
});
