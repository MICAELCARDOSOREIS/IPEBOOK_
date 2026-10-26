import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { DraftsState, DraftsActions } from "@/viewmodel/useDraftsViewModel";
import { Drafts } from "@/view/listings/drafts";
import DraftsScreen from "@/view/listings/drafts";
import { Alert } from "react-native";

vi.mock("@/viewmodel/useDraftsViewModel", () => ({
  useDraftsViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("react-native", async () => {
  const actual = await vi.importActual<Record<string, unknown>>("react-native");
  return { ...actual, Alert: { alert: vi.fn() } };
});

import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
const mockedUseDraftsViewModel = vi.mocked(useDraftsViewModel);

function mockViewModel(state: Partial<DraftsState> = {}, actions: Partial<DraftsActions> = {}) {
  const fullState: DraftsState = {
    drafts: [],
    loading: false,
    error: null,
    discardingId: null,
    discardError: null,
    ...state,
  };
  const fullActions: DraftsActions = {
    reload: vi.fn().mockResolvedValue(undefined),
    discardDraft: vi.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseDraftsViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

const draft = (over: Partial<Book> = {}): Book => ({
  id: "d1",
  title: "Dom Casmurro",
  author: "",
  ownerId: "u1",
  modality: "donation",
  status: "draft",
  draftStep: 3,
  ...over,
});

describe("tela de Rascunhos (Spec 017 — Figma 04.11 a 04.16)", () => {
  it("mostra o estado de carregamento", async () => {
    mockViewModel({ loading: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    expect(screen.getByText(/Carregando seus rascunhos/)).toBeTruthy();
  });

  it("mostra estado vazio com chamada para anunciar", async () => {
    const onNavigateToCreateListing = vi.fn();
    mockViewModel({ drafts: [], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Drafts sessionUserId="u1" onNavigateToCreateListing={onNavigateToCreateListing} />,
      );
    });
    expect(screen.getByText("Nenhum rascunho por aqui")).toBeTruthy();
    fireEvent.press(screen.getByText("Anunciar um livro"));
    expect(onNavigateToCreateListing).toHaveBeenCalled();
  });

  it("mostra estado vazio sem botão quando não há destino de anúncio", async () => {
    mockViewModel({ drafts: [], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    expect(screen.getByText("Nenhum rascunho por aqui")).toBeTruthy();
    expect(screen.queryByText("Anunciar um livro")).toBeNull();
  });

  it("mostra erro com ação de recarregar", async () => {
    const actions = mockViewModel({ error: "Sem conexão.", loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    expect(screen.getByText("Sem conexão.")).toBeTruthy();
    fireEvent.press(screen.getByText(/Tentar novamente/i));
    expect(actions.reload).toHaveBeenCalled();
  });

  it("renderiza cartão com título, etapa e botões Retomar/Descartar", async () => {
    mockViewModel({ drafts: [draft()], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" onResume={vi.fn()} />);
    });
    expect(screen.getByText("Dom Casmurro")).toBeTruthy();
    expect(screen.getByText("Parou nos detalhes")).toBeTruthy();
    expect(screen.getByText("Retomar")).toBeTruthy();
    expect(screen.getByText("Descartar")).toBeTruthy();
  });

  it("usa 'Sem título' quando o rascunho não tem título", async () => {
    mockViewModel({ drafts: [draft({ title: "" })], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    expect(screen.getAllByText("Sem título").length).toBeGreaterThan(0);
  });

  it("retomar chama onResume com o id do rascunho", async () => {
    const onResume = vi.fn();
    mockViewModel({ drafts: [draft({ id: "abc" })], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" onResume={onResume} />);
    });
    fireEvent.press(screen.getByText("Retomar"));
    expect(onResume).toHaveBeenCalledWith("abc");
  });

  it("mostra rótulo padrão, erro de descarte e estado descartando sem chamar para anunciar", async () => {
    mockViewModel({
      drafts: [draft({ id: "x", title: "", draftStep: 9 })],
      loading: false,
      discardingId: "x",
      discardError: "Falha ao descartar.",
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    // draftStep fora do intervalo cai no rótulo padrão "no livro".
    expect(screen.getByText("Parou no livro")).toBeTruthy();
    expect(screen.getByText("Descartando…")).toBeTruthy();
    expect(screen.getByText("Falha ao descartar.")).toBeTruthy();
    // Sem onResume nem onNavigateToCreateListing: não mostra o botão de anunciar.
    expect(screen.queryByText("Anunciar um livro")).toBeNull();
  });

  it("usa a etapa padrão quando o rascunho não registra draftStep", async () => {
    const book: Book = { id: "y", title: "Rascunho", author: "", ownerId: "u1", modality: "donation", status: "draft" };
    mockViewModel({ drafts: [book], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    expect(screen.getByText("Parou no livro")).toBeTruthy();
  });

  it("descartar abre confirmação e chama discardDraft ao confirmar", async () => {
    const alertMock = vi.mocked(Alert.alert);
    alertMock.mockClear();
    const actions = mockViewModel({ drafts: [draft()], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Drafts sessionUserId="u1" />);
    });
    fireEvent.press(screen.getByText("Descartar"));
    expect(alertMock).toHaveBeenCalledWith(
      "Descartar rascunho?",
      expect.any(String),
      expect.arrayContaining([expect.objectContaining({ text: "Descartar" })]),
    );
    const buttons = alertMock.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const confirmar = buttons.find((b) => b.text === "Descartar");
    confirmar?.onPress?.();
    expect(actions.discardDraft).toHaveBeenCalledWith("d1");
  });
});

describe("contêiner de sessão da tela de Rascunhos (Spec 017)", () => {
  const noopAuth = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() };

  it("redireciona para entrar quando não há sessão", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([{ user: null, loading: false, error: null }, noopAuth] as never);
    mockViewModel({ drafts: [], loading: false });
    const onRequireSignIn = vi.fn();
    await act(async () => {
      await render(<DraftsScreen onRequireSignIn={onRequireSignIn} />);
    });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });

  it("não renderiza nem redireciona enquanto a sessão carrega", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([{ user: null, loading: true, error: null }, noopAuth] as never);
    mockViewModel({ drafts: [], loading: true });
    const onRequireSignIn = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<DraftsScreen onRequireSignIn={onRequireSignIn} />);
    });
    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.toJSON()).toBeNull();
  });

  it("renderiza a lista de rascunhos quando autenticado", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([
      { user: { id: "u1", email: "p@e.com" }, loading: false, error: null },
      noopAuth,
    ] as never);
    mockViewModel({ drafts: [draft()], loading: false });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<DraftsScreen onBack={vi.fn()} onResume={vi.fn()} />);
    });
    expect(screen.getByText("Dom Casmurro")).toBeTruthy();
  });
});
