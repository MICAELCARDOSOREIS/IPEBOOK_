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
vi.mock("@/viewmodel/useProfilePhotoViewModel", () => ({ useProfilePhotoViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";
import { useProfilePhotoViewModel } from "@/viewmodel/useProfilePhotoViewModel";

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
    sessionLoading?: boolean;
    profile?: ProfileState["profile"];
    error?: string | null;
    saving?: boolean;
    preferences?: UserPreferencesState["preferences"];
    preferencesError?: string | null;
    pickedPhotoUrl?: string | null;
    photoError?: string | null;
  } = {},
) {
  const choose = vi.fn().mockResolvedValue(options.pickedPhotoUrl ?? null);
  vi.mocked(useProfilePhotoViewModel).mockReturnValue([
    { uploading: false, error: options.photoError ?? null },
    { choose, clearError: vi.fn() },
  ]);
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user, loading: options.sessionLoading ?? false, error: null },
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
    { update, reload: vi.fn() },
  ]);
  const updatePreferences = vi.fn().mockResolvedValue(true);
  vi.mocked(useUserPreferencesViewModel).mockReturnValue([
    {
      preferences: options.preferences === undefined ? emptyPreferences : options.preferences,
      loading: false,
      saving: false,
      error: options.preferencesError ?? null,
    },
    { update: updatePreferences, reload: vi.fn() },
  ]);
  return { update, updatePreferences, choose };
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
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(update).toHaveBeenCalledWith({ name: "Ana Paula", photoUrl: undefined, socialHandle: undefined });
  });

  it("mostra a pré-visualização do cartão de leitor e a atualiza ao digitar o nome (Spec 078, CA4)", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    expect(screen.getByText("Assim seu cartão aparece")).toBeDefined();
    expect(screen.getByLabelText("Cartão de leitor de Ana")).toBeDefined();
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), "Ana Paula"); });
    expect(screen.getByLabelText("Cartão de leitor de Ana Paula")).toBeDefined();
  });

  it("mostra confirmação após salvar", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
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
    expect(screen.getByDisplayValue("(86) 99999-8888")).toBeDefined();
  });

  it("salva telefone e bairro selecionado (Issue #141)", async () => {
    const { update, updatePreferences } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Telefone/WhatsApp"), "86988887777");
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mostrar atalhos de bairros populares"));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Bairro Centro"));
    });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(update).toHaveBeenCalledWith({ name: "Ana", photoUrl: undefined, socialHandle: undefined });
    expect(updatePreferences).toHaveBeenCalledWith({ phone: "(86) 98888-7777", neighborhood: "Centro" });
  });

  it("mostra erro de domínio das preferências", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" }, { preferencesError: "Selecione um bairro válido de Piripiri." });
    const screen = await renderProfile();
    expect(screen.getByText("Selecione um bairro válido de Piripiri.")).toBeDefined();
  });

  it("valida em linha e bloqueia o salvamento quando o nome está vazio", async () => {
    const { update, updatePreferences } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), "   "); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(screen.getByText("Informe um nome público.")).toBeDefined();
    expect(update).not.toHaveBeenCalled();
    expect(updatePreferences).not.toHaveBeenCalled();
  });

  it("escolhe a foto pela galeria, mostra no cartão e grava ao salvar (Spec 080, CA3)", async () => {
    const { update, choose } = setup({ id: "ana", email: "ana@exemplo.com" }, { pickedPhotoUrl: "https://cdn/ana/perfil/a.jpg" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.press(screen.getByLabelText("Escolher foto da galeria")); });
    expect(choose).toHaveBeenCalledWith("library");
    expect(screen.getByLabelText("Remover foto do perfil")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(update).toHaveBeenCalledWith({ name: "Ana", photoUrl: "https://cdn/ana/perfil/a.jpg", socialHandle: undefined });
  });

  it("tira foto com a câmera e mostra o erro do envio (Spec 080, CA4)", async () => {
    const { choose } = setup({ id: "ana", email: "ana@exemplo.com" }, { photoError: "Permita o acesso à câmera." });
    const screen = await renderProfile();
    await act(async () => { fireEvent.press(screen.getByLabelText("Tirar foto com a câmera")); });
    expect(choose).toHaveBeenCalledWith("camera");
    expect(screen.getByText("Permita o acesso à câmera.")).toBeDefined();
  });

  it("normaliza o Instagram com @ e recusa link ou caracteres inválidos (Spec 080, CA5)", async () => {
    const { update } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Instagram"), "instagram.com/ana"); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(screen.getByText("Use só letras, números, ponto e _ (até 30), sem link.")).toBeDefined();
    expect(update).not.toHaveBeenCalled();

    await act(async () => { fireEvent.changeText(screen.getByLabelText("Instagram"), " ana.lima_ "); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(update).toHaveBeenCalledWith({ name: "Ana", photoUrl: undefined, socialHandle: "@ana.lima_" });
  });

  it("valida telefone incompleto em linha ao salvar", async () => {
    const { updatePreferences } = setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Telefone/WhatsApp"), "86999");
    });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(screen.getByText("Informe um telefone válido com DDD.")).toBeDefined();
    expect(updatePreferences).not.toHaveBeenCalled();
  });

  it("limpa o erro em linha quando a pessoa corrige o campo", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), ""); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(screen.getByText("Informe um nome público.")).toBeDefined();
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Nome público"), "Ana Rê"); });
    expect(screen.queryByText("Informe um nome público.")).toBeNull();
  });

  it("anuncia no leitor de tela que há campos destacados quando o salvamento é bloqueado", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), "   "); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(screen.getByText("Confira os campos destacados para salvar.")).toBeDefined();
  });

  it("mostra estado de carregamento em vez de tela em branco enquanto a sessão não chegou", async () => {
    setup(null, { sessionLoading: true });
    const screen = await renderProfile();
    expect(screen.getByText(/Carregando sessão/)).toBeDefined();
  });

  it("oferece um caminho claro para quem não tem conta, além de redirecionar", async () => {
    const onNavigateToSignIn = vi.fn();
    setup(null);
    const screen = await renderProfile({ onNavigateToSignIn });
    expect(screen.getByText("Entre para editar seu perfil")).toBeDefined();
    expect(screen.getByText("Entrar ou criar conta")).toBeDefined();
    expect(onNavigateToSignIn).toHaveBeenCalledTimes(1);
  });

  it("não atribui bairro quando as preferências não trazem nenhum", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    expect(screen.getByText("Selecionar bairro")).toBeDefined();
    expect(screen.queryByText("Bairro selecionado: Centro. Toque para alterar")).toBeNull();
  });

  it("rotula os atalhos como bairros de Piripiri, sem inventar frequência", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Mostrar atalhos de bairros populares"));
    });
    expect(screen.getByText("Bairros de Piripiri")).toBeDefined();
    expect(screen.queryByText("Bairros mais frequentes")).toBeNull();
  });

  it("mantém os atalhos de bairro recolhidos por padrão", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const screen = await renderProfile();
    expect(screen.getByLabelText("Mostrar atalhos de bairros populares")).toBeDefined();
    expect(screen.queryByText("Bairros de Piripiri")).toBeNull();
  });

  it("volta direto quando não há edição em aberto", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const onBack = vi.fn();
    const screen = await renderProfile({ onBack });
    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Descartar alterações?")).toBeNull();
  });

  it("pergunta antes de descartar alterações não salvas", async () => {
    setup({ id: "ana", email: "ana@exemplo.com" });
    const onBack = vi.fn();
    const screen = await renderProfile({ onBack });
    await act(async () => { fireEvent.changeText(screen.getByDisplayValue("Ana"), "Ana Lima"); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    expect(screen.getByText("Descartar alterações?")).toBeDefined();
    expect(onBack).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(screen.getByText("Continuar editando")); });
    expect(screen.queryByText("Descartar alterações?")).toBeNull();
    expect(onBack).not.toHaveBeenCalled();

    await act(async () => { fireEvent.press(screen.getByLabelText("Voltar")); });
    await act(async () => { fireEvent.press(screen.getByText("Descartar")); });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("remove a foto em um toque e salva sem link", async () => {
    const { update } = setup({
      id: "ana",
      email: "ana@exemplo.com",
    }, { profile: { ...profile, photoUrl: "https://exemplo.com/ana.png" } });
    const screen = await renderProfile();
    await act(async () => { fireEvent.press(screen.getByLabelText("Remover foto do perfil")); });
    await act(async () => { fireEvent.press(screen.getByText(/Salvar/)); });
    expect(update).toHaveBeenCalledWith({ name: "Ana", photoUrl: undefined, socialHandle: undefined });
  });
});
