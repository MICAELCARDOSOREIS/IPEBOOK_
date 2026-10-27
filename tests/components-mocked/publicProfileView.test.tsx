import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { PublicProfile } from "@/model/entities/publicProfile";
import { PublicProfile as PublicProfileView } from "@/view/listings/publicProfile";

vi.mock("@/viewmodel/usePublicProfileViewModel", () => ({ usePublicProfileViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileSafetyViewModel", () => ({ useProfileSafetyViewModel: vi.fn() }));
vi.mock("@/viewmodel/useChatWithUser", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/viewmodel/useChatWithUser")>()),
  useChatWithUser: vi.fn(),
}));

import * as Linking from "expo-linking";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { useChatWithUser } from "@/viewmodel/useChatWithUser";
import { useProfileSafetyViewModel } from "@/viewmodel/useProfileSafetyViewModel";

const profile = (over: Partial<PublicProfile> = {}): PublicProfile => ({
  userId: "ana",
  name: "Ana Paula",
  joinedAt: "2026-01-10T00:00:00.000Z",
  averageRating: null,
  ratingCount: 0,
  completedNegotiations: 0,
  ...over,
});

const start = vi.fn().mockResolvedValue(undefined);
const loadListings = vi.fn().mockResolvedValue(undefined);
const block = vi.fn().mockResolvedValue(true);
const listingA = { id: "l1", title: "Dom Casmurro", author: "Machado", ownerId: "ana", modality: "trade", status: "available" } as const;

function setup(
  profileValue: PublicProfile | null,
  options: { loading?: boolean; error?: string | null; viewerId?: string } = {},
) {
  vi.mocked(useAuthViewModel).mockReturnValue([
    { user: options.viewerId ? { id: options.viewerId, email: "x@exemplo.com" } : null, loading: false, error: null },
    {} as ReturnType<typeof useAuthViewModel>[1],
  ]);
  const reload = vi.fn().mockResolvedValue(undefined);
  vi.mocked(useChatWithUser).mockImplementation(() => ({ busy: false, notice: null, start }));
  vi.mocked(useProfileSafetyViewModel).mockReturnValue([
    { listings: [listingA], loadingListings: false, blocking: false, blocked: false, error: null },
    { loadListings, block, clearError: vi.fn() },
  ]);
  vi.mocked(usePublicProfileViewModel).mockReturnValue([
    { profile: profileValue, loading: options.loading ?? false, error: options.error ?? null },
    { reload },
  ]);
  return reload;
}

async function renderView(props: Partial<React.ComponentProps<typeof PublicProfileView>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<PublicProfileView userId="ana" {...props} />);
  });
  return screen;
}

describe("PublicProfile (spec 018 / issue #73)", () => {
  it("mostra indicador de carregamento", async () => {
    setup(null, { loading: true });
    const screen = await renderView();
    expect(screen.getByLabelText("Carregando perfil")).toBeDefined();
  });

  it("mostra nome e data de entrada na comunidade", async () => {
    setup(profile({ name: "Ana Paula" }));
    const screen = await renderView();
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText(/Na comunidade desde/)).toBeDefined();
  });

  it("mostra estado claro quando não há avaliações ainda", async () => {
    setup(profile({ ratingCount: 0, averageRating: null }));
    const screen = await renderView();
    expect(screen.getByText("Sem avaliações ainda")).toBeDefined();
  });

  it("mostra média e contagem de avaliações quando existem (plural)", async () => {
    setup(profile({ ratingCount: 2, averageRating: 4.5 }));
    const screen = await renderView();
    expect(screen.getByText("4.5")).toBeDefined();
    expect(screen.getByText("Avaliação média (2 avaliações)")).toBeDefined();
  });

  it("usa singular quando há apenas uma avaliação", async () => {
    setup(profile({ ratingCount: 1, averageRating: 5 }));
    const screen = await renderView();
    expect(screen.getByText("Avaliação média (1 avaliação)")).toBeDefined();
  });

  it("mostra a quantidade de negociações concluídas (plural)", async () => {
    setup(profile({ completedNegotiations: 3 }));
    const screen = await renderView();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("Negociações concluídas")).toBeDefined();
  });

  it("usa singular quando há apenas uma negociação concluída", async () => {
    setup(profile({ completedNegotiations: 1 }));
    const screen = await renderView();
    expect(screen.getByText("Negociação concluída")).toBeDefined();
  });

  it("não quebra com data de entrada inválida", async () => {
    setup(profile({ joinedAt: "data-invalida" }));
    const screen = await renderView();
    expect(screen.getByText(/Na comunidade desde/)).toBeDefined();
  });

  it("mostra erro de domínio e permite tentar novamente", async () => {
    const reload = setup(null, { error: "Usuário não encontrado." });
    const screen = await renderView();
    expect(screen.getByRole("alert").props.children).toBe("Usuário não encontrado.");
    await act(async () => { fireEvent.press(screen.getByText("Tentar novamente")); });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("mostra a rede social quando informada (Spec 006 / Issue #55)", async () => {
    setup(profile({ socialHandle: "@anapaula" }));
    const screen = await renderView();
    expect(screen.getByText("@anapaula")).toBeDefined();
  });

  it("abre o Instagram ao tocar no @ (sem @ duplicado na URL)", async () => {
    const openURL = vi.spyOn(Linking, "openURL").mockResolvedValue(true);
    setup(profile({ socialHandle: "@anapaula" }));
    const screen = await renderView();
    fireEvent.press(screen.getByLabelText("Abrir Instagram @anapaula"));
    expect(openURL).toHaveBeenCalledWith("https://instagram.com/anapaula");
    openURL.mockRestore();
  });

  it("esconde conversar e denunciar no próprio perfil", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }), { viewerId: "ana" });
    const screen = await renderView();
    expect(screen.queryByLabelText("Conversar com Ana Paula")).toBeNull();
    expect(screen.queryByLabelText("Denunciar ou bloquear")).toBeNull();
  });

  it("não mostra rede social quando ausente", async () => {
    setup(profile({ socialHandle: undefined }));
    const screen = await renderView();
    expect(screen.queryByText(/^@/)).toBeNull();
  });

  it("mostra o avatar com o nome como rótulo acessível", async () => {
    setup(profile({ name: "Ana Paula" }));
    const screen = await renderView();
    expect(screen.getByLabelText("Ana Paula")).toBeDefined();
  });

  it("aciona onBack ao tocar no botão voltar da barra superior", async () => {
    setup(profile());
    const onBack = vi.fn();
    const screen = await renderView({ onBack });
    fireEvent.press(screen.getByLabelText("Voltar"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("inicia a busca da conversa ao tocar no botão de conversa (Spec 091)", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }));
    start.mockClear();
    const screen = await renderView();
    fireEvent.press(screen.getByText("Conversar com Ana Paula"));
    expect(start).toHaveBeenCalledTimes(1);
  });

  it("explica como começar quando ainda não há conversa (Spec 091)", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }));
    vi.mocked(useChatWithUser).mockImplementation(() => ({ busy: false, notice: "Ainda não há conversa com essa pessoa.", start }));
    const screen = await renderView();
    expect(screen.getByText("Ainda não há conversa com essa pessoa.")).toBeDefined();
  });

  it("abre a folha de segurança e bloqueia a pessoa depois de confirmar (Spec 091)", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }), { viewerId: "me" });
    block.mockClear();
    const onBack = vi.fn();
    const screen = await renderView({ onBack });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar ou bloquear")); });
    expect(screen.getByText("Denunciar um anúncio")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Bloquear Ana Paula")); });
    expect(screen.getByText("Bloquear esta pessoa?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Bloquear")); });
    expect(block).toHaveBeenCalledTimes(1);
    await act(async () => {});
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("leva à denúncia da pessoa (Spec 091)", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }), { viewerId: "me" });
    const onReportUser = vi.fn();
    const screen = await renderView({ onReportUser });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar ou bloquear")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar Ana Paula")); });
    expect(onReportUser).toHaveBeenCalledWith("ana", "Ana Paula");
  });

  it("leva à denúncia do anúncio escolhido (Spec 091)", async () => {
    setup(profile({ userId: "ana", name: "Ana Paula" }), { viewerId: "me" });
    loadListings.mockClear();
    const onReportListing = vi.fn();
    const screen = await renderView({ onReportListing });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar ou bloquear")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar um anúncio de Ana Paula")); });
    expect(screen.getByText("Qual anúncio denunciar?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Denunciar o anúncio Dom Casmurro")); });
    expect(onReportListing).toHaveBeenCalledWith("l1");
  });

  it("resume o rótulo do botão de conversa mantendo acessibilidade completa para nomes longos", async () => {
    setup(profile({ name: "Biblioteca Comunitária de Piripiri" }));
    const screen = await renderView();
    expect(screen.getByText("Conversar com Biblioteca")).toBeDefined();
    expect(screen.getByLabelText("Conversar com Biblioteca Comunitária de Piripiri")).toBeDefined();
  });
});
