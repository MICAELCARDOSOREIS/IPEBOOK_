import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import Home from "@/view/home";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

const mockedUseHomeViewModel = vi.mocked(useHomeViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

const baseHomeState: HomeState = { books: [], loading: false, error: null };
const baseHomeActions: HomeActions = { reload: vi.fn() };

describe("indicador de sessão na Home (ISO/IEC 25010 - Usabilidade)", () => {
  it("mostra link de Entrar quando não há sessão autenticada", async () => {
    mockedUseHomeViewModel.mockReturnValue([baseHomeState, baseHomeActions]);
    const authState: AuthState = { user: null, loading: false, error: null };
    const authActions: AuthActions = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
    mockedUseAuthViewModel.mockReturnValue([authState, authActions]);
    const onNavigateToSignIn = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home onNavigateToSignIn={onNavigateToSignIn} />);
    });

    const entrarButton = screen.getByText("Entrar");
    await act(async () => {
      fireEvent.press(entrarButton);
    });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });

  it("mostra e-mail da sessão e botão Sair quando autenticado", async () => {
    mockedUseHomeViewModel.mockReturnValue([baseHomeState, baseHomeActions]);
    const authState: AuthState = {
      user: { id: "1", email: "pessoa@exemplo.com" },
      loading: false,
      error: null,
    };
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut };
    mockedUseAuthViewModel.mockReturnValue([authState, authActions]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.getByText("Olá, pessoa@exemplo.com")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByText("Sair"));
    });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it("mostra botão Anunciar quando autenticado e aciona a navegação", async () => {
    mockedUseHomeViewModel.mockReturnValue([baseHomeState, baseHomeActions]);
    const authState: AuthState = {
      user: { id: "1", email: "pessoa@exemplo.com" },
      loading: false,
      error: null,
    };
    const authActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
    mockedUseAuthViewModel.mockReturnValue([authState, authActions]);
    const onNavigateToCreateListing = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home onNavigateToCreateListing={onNavigateToCreateListing} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Anunciar"));
    });
    expect(onNavigateToCreateListing).toHaveBeenCalledTimes(1);
  });

  it("não mostra botão Anunciar quando não há sessão autenticada", async () => {
    mockedUseHomeViewModel.mockReturnValue([baseHomeState, baseHomeActions]);
    mockedUseAuthViewModel.mockReturnValue([
      { user: null, loading: false, error: null },
      { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.queryByText("Anunciar")).toBeNull();
  });

  it("não mostra indicador de sessão enquanto a sessão está carregando", async () => {
    mockedUseHomeViewModel.mockReturnValue([baseHomeState, baseHomeActions]);
    mockedUseAuthViewModel.mockReturnValue([
      { user: null, loading: true, error: null },
      { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    expect(screen.queryByText("Entrar")).toBeNull();
    expect(screen.queryByText(/^Olá,/)).toBeNull();
  });
});
