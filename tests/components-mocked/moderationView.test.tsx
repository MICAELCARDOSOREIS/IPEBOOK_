import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { ModerationItem } from "@/model/entities/moderation";
import { Moderation } from "@/view/moderation/moderation";

vi.mock("@/viewmodel/useModerationViewModel", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/viewmodel/useModerationViewModel")>()),
  useModerationViewModel: vi.fn(),
}));

import { type ModerationState, useModerationViewModel } from "@/viewmodel/useModerationViewModel";

const decide = vi.fn().mockResolvedValue(true);
const listing: ModerationItem = {
  kind: "listing", targetId: "b1", label: "Dom Casmurro", ownerId: "ana",
  reasons: ["fraud_or_scam", "misleading_info"], details: ["Foto não é do livro"], reportCount: 3,
  firstReportedAt: "2026-10-28T10:00:00Z",
};
const person: ModerationItem = { ...listing, kind: "user", targetId: "ana", label: "Ana", reasons: ["fake_profile"], details: [], reportCount: 1 };

function setup(state: Partial<ModerationState>) {
  vi.mocked(useModerationViewModel).mockReturnValue([
    { items: [], loading: false, error: null, decidingId: null, actionMessage: null, ...state },
    { reload: vi.fn(), decide, clearActionMessage: vi.fn() },
  ]);
}

async function renderView() {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Moderation sessionUserId="mod" onBack={vi.fn()} />);
  });
  return screen;
}

describe("Moderation (Spec 102)", () => {
  it("mostra motivos, detalhes e contagem; pessoa não tem 'Remover anúncio'", async () => {
    setup({ items: [listing, person] });
    const screen = await renderView();
    expect(screen.getByText("3 denúncias")).toBeDefined();
    expect(screen.getByText("Golpe ou fraude · Informação enganosa")).toBeDefined();
    expect(screen.getByText("“Foto não é do livro”")).toBeDefined();
    expect(screen.getAllByText("Remover anúncio")).toHaveLength(1);
    expect(screen.getAllByText("Suspender conta")).toHaveLength(2);
  });

  it("arquiva direto e pede confirmação para remover", async () => {
    setup({ items: [listing] });
    decide.mockClear();
    const screen = await renderView();
    await act(async () => { fireEvent.press(screen.getByLabelText("Arquivar denúncias de Dom Casmurro")); });
    expect(decide).toHaveBeenCalledWith(listing, "dismiss");
    await act(async () => { fireEvent.press(screen.getByLabelText("Remover anúncio Dom Casmurro")); });
    expect(screen.getByText("Remover anúncio?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Remover")); });
    expect(decide).toHaveBeenCalledWith(listing, "remove_listing");
  });

  it("mostra fila vazia e erro de acesso", async () => {
    setup({ items: [] });
    expect((await renderView()).getByText("Nenhuma denúncia aberta")).toBeDefined();
    setup({ error: "Acesso restrito à moderação." });
    expect((await renderView()).getByText("Acesso restrito à moderação.")).toBeDefined();
  });

  it("suspende com confirmação, abre o alvo e mantém o diálogo se a decisão falhar", async () => {
    const onOpenListing = vi.fn();
    const onOpenProfile = vi.fn();
    setup({ items: [listing, person], loading: true, decidingId: "zzz" });
    decide.mockClear();
    decide.mockResolvedValueOnce(false);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Moderation sessionUserId="mod" onBack={vi.fn()} onOpenListing={onOpenListing} onOpenProfile={onOpenProfile} />);
    });
    await act(async () => { fireEvent.press(screen.getByLabelText("Abrir Dom Casmurro")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Abrir Ana")); });
    expect(onOpenListing).toHaveBeenCalledWith("b1");
    expect(onOpenProfile).toHaveBeenCalledWith("ana");
    await act(async () => { fireEvent.press(screen.getByLabelText("Suspender conta ligada a Ana")); });
    expect(screen.getByText("Suspender conta?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Suspender")); });
    expect(decide).toHaveBeenCalledWith(person, "suspend_user");
    expect(screen.getByText("Suspender conta?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Voltar")); });
  });

  it("carregando sem itens mostra o indicador; tentar de novo recarrega", async () => {
    const reload = vi.fn();
    vi.mocked(useModerationViewModel).mockReturnValue([
      { items: [], loading: true, error: null, decidingId: null, actionMessage: "Conta suspensa.", },
      { reload, decide, clearActionMessage: vi.fn() },
    ]);
    expect((await renderView()).getByLabelText("Carregando denúncias")).toBeDefined();
    vi.mocked(useModerationViewModel).mockReturnValue([
      { items: [], loading: false, error: "Falhou", decidingId: null, actionMessage: null },
      { reload, decide, clearActionMessage: vi.fn() },
    ]);
    const screen = await renderView();
    await act(async () => { fireEvent.press(screen.getByText("Tentar de novo")); });
    expect(reload).toHaveBeenCalled();
  });
});
