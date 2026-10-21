import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileState } from "@/viewmodel/useProfileViewModel";
import type { UserPreferencesState } from "@/viewmodel/useUserPreferencesViewModel";
import Profile from "@/view/profile/profile";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));
vi.mock("@/viewmodel/useUserPreferencesViewModel", () => ({ useUserPreferencesViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";

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

const emptyPreferences = { userId: "ana", phone: undefined, neighborhood: undefined };

function setup(
  user: AuthState["user"],
  options: {
    loading?: boolean;
    profile?: ProfileState["profile"];
    error?: string | null;
    saving?: boolean;
    preferences?: UserPreferencesState["preferences"];
    preferencesError?: string | null;
  } = {},
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
  const updatePreferences = vi.fn().mockResolvedValue(true);
  vi.mocked(useUserPreferencesViewModel).mockReturnValue([
    {
      preferences: options.preferences === undefined ? emptyPreferences : options.preferences,
      loading: false,
      saving: false,
      error: options.preferencesError ?? null,
    },
    { update: updatePreferences },
  ]);
  return { update, updatePreferences };
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

  it("preenche telefone e bairro com as preferências carregadas (Issue #141)", async () => {
    setup(
      { id: "ana", email: "ana@exemplo.com" },
      { preferences: { userId: "ana", phone: "86999998888", neighborhood: "Centro" } },
    );
    const screen = await renderProfile();
    expect(screen.getByDisplayValue("86999998888")).toBeDefined();
  });

  it("salva telefone e bairro selecionado (Issue #141)", async () => {
    const { update, updatePreferences } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Telefone/WhatsApp"), "86988887777");
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Bairro Centro"));
    });
    await act(async () => { fireEvent.press(screen.getByText("Salvar")); });
    expect(update).toHaveBeenCalledWith({ name: "Ana", photoUrl: undefined, socialHandle: undefined });
    expect(updatePreferences).toHaveBeenCalledWith({ phone: "86988887777", neighborhood: "Centro" });
  });

  it("mostra erro de domínio das preferências", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" }, { preferencesError: "Selecione um bairro válido de Piripiri." });
    const screen = await renderProfile();
    expect(screen.getByText("Selecione um bairro válido de Piripiri.")).toBeDefined();
  });
});
