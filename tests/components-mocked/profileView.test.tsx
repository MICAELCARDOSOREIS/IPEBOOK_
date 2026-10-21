import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileState } from "@/viewmodel/useProfileViewModel";
import Profile from "@/view/profile/profile";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";

const profile = {
  userId: "ana",
  name: "Ana",
  joinedAt: "2026-01-01T00:00:00.000Z",
  averageRating: null,
  ratingCount: 0,
  completedNegotiations: 0,
  photoUrl: undefined,
  socialHandle: undefined,
};

function setup(
  user: AuthState["user"],
  options: { loading?: boolean; profile?: ProfileState["profile"]; error?: string | null; saving?: boolean } = {},
) {
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: false, error: null },
    { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
  ]);
  const update = vi.fn().mockResolvedValue(true);
  vi.mocked(useProfileViewModel).mockReturnValue([
    {
      profile: options.profile === undefined ? profile : options.profile,
      loading: options.loading ?? false,
      saving: options.saving ?? false,
      error: options.error ?? null,
    },
    { update },
  ]);
  return { update };
}

async function renderProfile(props: Partial<React.ComponentProps<typeof Profile>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Profile {...props} />);
  });
  return screen;
}

describe("Profile (Spec 006 US4, Issue #55)", () => {
  it("redireciona para o login quando não há sessão", async () => {
    setup(null);
    const onNavigateToSignIn = vi.fn();
    await renderProfile({ onNavigateToSignIn });
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });

  it("preenche os campos com os dados do perfil carregado", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    expect(screen.getByDisplayValue("Ana")).toBeDefined();
  });

  it("salva as alterações ao tocar em Salvar", async () => {
    const { update } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), "Ana Paula"); });
    await act(async () => { fireEvent.press(screen.getByText("Salvar")); });
    expect(update).toHaveBeenCalledWith({ name: "Ana Paula", photoUrl: undefined, socialHandle: undefined });
  });

  it("mostra confirmação após salvar", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.press(screen.getByText("Salvar")); });
    expect(screen.getByText("Perfil atualizado")).toBeDefined();
  });

  it("mostra erro de domínio ao carregar o perfil", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" }, { profile: null, error: "Usuário não encontrado." });
    const screen = await renderProfile();
    expect(screen.getByText("Usuário não encontrado.")).toBeDefined();
  });
});
