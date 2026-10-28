import React from "react";
import { act, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import Home from "@/view/home";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

const homeState: HomeState = { books: [], loading: false, error: null };
const homeActions: HomeActions = { reload: vi.fn() };
const authState: AuthState = {
  user: { id: "u1", name: "Ana", email: "ana@example.com" } as AuthState["user"],
  loading: false,
  error: null,
};
const authActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() };

function mockUnread(unreadCount: number) {
  vi.mocked(useNotificationsViewModel).mockReturnValue([
    { unreadCount } as NotificationsState,
    { refresh: vi.fn(), reload: vi.fn() } as unknown as NotificationsActions,
  ]);
}

describe("sino de notificações na Home (convite e resposta de encontro)", () => {
  beforeEach(() => {
    vi.mocked(useHomeViewModel).mockReturnValue([homeState, homeActions]);
    vi.mocked(useAuthViewModel).mockReturnValue([authState, authActions]);
  });

  it("com notificações não lidas, mostra o contador e anuncia a quantidade", async () => {
    mockUnread(2);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });
    expect(screen.getByRole("button", { name: "Abrir notificações, 2 não lidas" })).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("com uma só não lida, anuncia no singular", async () => {
    mockUnread(1);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });
    expect(screen.getByRole("button", { name: "Abrir notificações, 1 não lida" })).toBeDefined();
  });

  it("sem não lidas, não mostra contador", async () => {
    mockUnread(0);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });
    expect(screen.getByRole("button", { name: "Abrir notificações" })).toBeDefined();
    expect(screen.queryByText("0")).toBeNull();
  });
});
