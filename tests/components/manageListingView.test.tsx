import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { ManageListingActions, ManageListingState } from "@/viewmodel/useManageListingViewModel";
import ManageListing from "@/view/listings/manageListing";

vi.mock("@/viewmodel/useManageListingViewModel", () => ({
  useManageListingViewModel: vi.fn(),
}));

import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";
const mockedUseManageListingViewModel = vi.mocked(useManageListingViewModel);

const book: Book = {
  id: "b1",
  title: "O Pequeno Príncipe",
  author: "Antoine de Saint-Exupéry",
  ownerId: "user-1",
  modality: "sale",
  price: 25,
  status: "available",
  condition: "good",
  city: "Piripiri",
  state: "PI",
  neighborhood: "Centro",
};

function mockViewModel(state: Partial<ManageListingState>, actions: Partial<ManageListingActions> = {}) {
  const fullState: ManageListingState = {
    book,
    loading: false,
    busy: false,
    error: null,
    removed: false,
    ...state,
  };
  const fullActions: ManageListingActions = {
    load: vi.fn().mockResolvedValue(undefined),
    togglePause: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(true),
    ...actions,
  };
  mockedUseManageListingViewModel.mockReturnValue([fullState, fullActions]);
  return fullActions;
}

async function renderScreen(props: Partial<React.ComponentProps<typeof ManageListing>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<ManageListing bookId="b1" sessionUserId="user-1" {...props} />);
  });
  return screen;
}

describe("tela de gerenciar anúncio (Figma 04.08)", () => {
  it("mostra o livro, o estado atual e as ações disponíveis", async () => {
    mockViewModel({});
    const screen = await renderScreen();

    const headers = screen.getAllByRole("header").map((node) => node.props.children);
    expect(headers).toContain("Gerenciar anúncio");
    expect(headers).toContain("Seu livro, suas escolhas.");
    expect(screen.getByText("O Pequeno Príncipe")).toBeDefined();
    expect(screen.getByText("Antoine de Saint-Exupéry")).toBeDefined();
    expect(screen.getByText("Bom estado")).toBeDefined();
    expect(screen.getByText("Centro · Piripiri · PI")).toBeDefined();
    expect(screen.getByText("Anúncio ativo")).toBeDefined();
    expect(screen.getByLabelText("Editar anúncio")).toBeDefined();
    expect(screen.getByLabelText("Pausar anúncio")).toBeDefined();
  });

  it("mostra o estado pausado e a ação de retomar", async () => {
    mockViewModel({ book: { ...book, status: "paused" } });
    const screen = await renderScreen();

    expect(screen.getByText("Anúncio pausado")).toBeDefined();
    expect(screen.getByLabelText("Retomar anúncio")).toBeDefined();
    expect(screen.queryByLabelText("Pausar anúncio")).toBeNull();
  });

  it("bloqueia edição e pausa quando há negociação aceita", async () => {
    mockViewModel({ book: { ...book, status: "reserved" } });
    const screen = await renderScreen();

    expect(screen.getByText("Negociação em andamento")).toBeDefined();
    expect(screen.getByLabelText("Editar anúncio").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText("Pausar anúncio").props.accessibilityState.disabled).toBe(true);
  });

  it("aciona a edição do anúncio", async () => {
    mockViewModel({});
    const onEdit = vi.fn();
    const screen = await renderScreen({ onEdit });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Editar anúncio"));
    });

    expect(onEdit).toHaveBeenCalledWith("b1");
  });

  it("pausa o anúncio pela ação correspondente", async () => {
    const actions = mockViewModel({});
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Pausar anúncio"));
    });

    expect(actions.togglePause).toHaveBeenCalledTimes(1);
  });

  it("só exclui depois da confirmação no diálogo", async () => {
    const actions = mockViewModel({});
    const onRemoved = vi.fn();
    const screen = await renderScreen({ onRemoved });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir anúncio" }));
    });
    expect(screen.getByText("Excluir anúncio?")).toBeDefined();
    expect(actions.remove).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir" }));
    });

    expect(actions.remove).toHaveBeenCalledTimes(1);
    expect(onRemoved).toHaveBeenCalledTimes(1);
  });

  it("mantém o anúncio quando a exclusão é cancelada", async () => {
    const actions = mockViewModel({});
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir anúncio" }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Manter anúncio" }));
    });

    expect(actions.remove).not.toHaveBeenCalled();
  });

  it("exibe carregamento e erro de carga", async () => {
    mockViewModel({ book: null, loading: true });
    const carregando = await renderScreen();
    expect(carregando.getByLabelText("Carregando anúncio")).toBeDefined();

    mockViewModel({ book: null, loading: false, error: "Você só pode gerenciar seus próprios anúncios." });
    const comErro = await renderScreen();
    expect(comErro.getByText("Você só pode gerenciar seus próprios anúncios.")).toBeDefined();
  });
});
