import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileState } from "@/viewmodel/useProfileViewModel";
import ProfileHub from "@/view/profile/profileHub";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";

const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
const mockedUseProfileViewModel = vi.mocked(useProfileViewModel);

const fakeProfile: NonNullable<ProfileState["profile"]> = {
  userId: "ana",
  name: "Ana Paula",
  joinedAt: "2026-01-01T00:00:00.000Z",
  averageRating: 4.5,
  ratingCount: 2,
  completedNegotiations: 3,
  photoUrl: undefined,
  socialHandle: undefined,
};

function mockAuth(user: AuthState["user"], signOut = vi.fn().mockResolvedValue(undefined)) {
  mockedUseAuthViewModel.mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut, requestPasswordReset: vi.fn() },
  ]);
  return { signOut };
}

function mockProfile(profile: ProfileState["profile"] = fakeProfile, loading = false) {
  mockedUseProfileViewModel.mockReturnValue([
    { profile, loading, saving: false, error: null },
    { update: vi.fn().mockResolvedValue(true) },
  ]);
}

const noop = () => {};

function baseProps(overrides: Partial<React.ComponentProps<typeof ProfileHub>> = {}) {
  return {
    onNavigateToEditProfile: noop,
    onNavigateToRatings: noop,
    onNavigateToNotifications: noop,
    onNavigateToSecurity: noop,
    onNavigateToPrivacy: noop,
    onNavigateToTerms: noop,
    onNavigateToHelp: noop,
    onSignedOut: noop,
    ...overrides,
  };
}

describe("Meu perfil — hub de navegação (Figma 07.01)", () => {
  afterEach(() => {
    cleanup();
  });

  it("leva a Favoritos e alertas (atalho que saiu da Home, Spec 062)", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();
    const onNavigateToFavorites = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ProfileHub {...baseProps({ onNavigateToFavorites })} />);
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Favoritos e alertas"));
    });
    expect(onNavigateToFavorites).toHaveBeenCalledTimes(1);
  });

  it("oferece o alternador de aparência (movido da Home, Spec 062)", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ProfileHub {...baseProps()} />);
    });
    expect(screen.getByTestId("theme-toggle-radiogroup")).toBeDefined();
    expect(screen.getByLabelText("Tema Sistema")).toBeDefined();
  });

  it("mostra nome, estatísticas e aciona a navegação de cada item do menu", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();
    const onNavigateToEditProfile = vi.fn();
    const onNavigateToRatings = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub {...baseProps({ onNavigateToEditProfile, onNavigateToRatings })} />,
      );
    });

    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText(/★ 4.5 \(2 avaliações\)/)).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Editar perfil"));
    });
    expect(onNavigateToEditProfile).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Avaliações recebidas"));
    });
    expect(onNavigateToRatings).toHaveBeenCalledTimes(1);
  });

  it("confirma e executa o logout ao tocar em Sair da conta", async () => {
    const { signOut } = mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();
    const onSignedOut = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ProfileHub {...baseProps({ onSignedOut })} />);
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Sair da conta"));
    });
    expect(screen.getByText("Sair da conta?")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Sair"));
    });

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it("cancelar no diálogo de saída não desconecta a conta", async () => {
    const { signOut } = mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ProfileHub {...baseProps()} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Sair da conta"));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Cancelar"));
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it("redireciona para login se não houver sessão", async () => {
    mockAuth(null);
    mockProfile(null);
    const onNavigateToSignIn = vi.fn();

    await act(async () => {
      await render(<ProfileHub {...baseProps({ onNavigateToSignIn })} />);
    });

    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });

  it("aciona a navegação para Convidar amigos (Spec 057, Figma 08.02)", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();
    const onNavigateToInviteFriends = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub {...baseProps({ onNavigateToInviteFriends })} />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Convidar amigos"));
    });
    expect(onNavigateToInviteFriends).toHaveBeenCalledTimes(1);
  });

  it("renderiza cabeçalho editorial, tríade de métricas e seções Atividade e Conta (Spec 065, Figma 07.01)", async () => {
    mockAuth({ id: "ana", email: "ana@exemplo.com" });
    mockProfile();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ProfileHub {...baseProps()} />);
    });

    // 1. Título editorial da marca
    expect(screen.getByRole("header").props.children).toBe("Meu perfil");

    // 2. Tríade de métricas
    expect(screen.getByText("publicações")).toBeDefined();
    expect(screen.getByText("trocas")).toBeDefined();
    expect(screen.getByText("avaliação")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined(); // completedNegotiations: 3
    expect(screen.getByText("4.5")).toBeDefined(); // averageRating: 4.5

    // 3. Seções agrupadas
    expect(screen.getByText("Atividade")).toBeDefined();
    expect(screen.getByText("Conta")).toBeDefined();
  });
});
