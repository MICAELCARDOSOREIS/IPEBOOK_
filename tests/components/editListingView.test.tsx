import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { EditListingState, EditListingActions } from "@/viewmodel/useEditListingViewModel";
import EditListing from "@/view/listings/editListing";

vi.mock("@/viewmodel/useEditListingViewModel", () => ({
  useEditListingViewModel: vi.fn(),
}));

import { useEditListingViewModel } from "@/viewmodel/useEditListingViewModel";
const mockedUseEditListingViewModel = vi.mocked(useEditListingViewModel);

function mockViewModel(state: EditListingState, actions: Partial<EditListingActions> = {}) {
  const fullActions: EditListingActions = {
    load: vi.fn().mockResolvedValue(undefined),
    setTitle: vi.fn(),
    setAuthor: vi.fn(),
    setCategory: vi.fn(),
    setModality: vi.fn(),
    setPrice: vi.fn(),
    setNeighborhood: vi.fn(),
    setPhotoUrl: vi.fn(),
    addPhoto: vi.fn(),
    removePhoto: vi.fn(),
    submit: vi.fn().mockResolvedValue(null),
    ...actions,
  };
  mockedUseEditListingViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

const loadedState: EditListingState = {
  book: {
    id: "b1",
    title: "Livro Antigo",
    author: "Autor Antigo",
    category: "Romance",
    modality: "sale",
    price: 30,
    ownerId: "user-1",
    status: "available",
    city: "Piripiri",
    state: "PI",
    neighborhood: "Centro",
  },
  title: "Livro Antigo",
  author: "Autor Antigo",
  category: "Romance",
  modality: "sale",
  price: "30",
  neighborhood: "Centro",
  photoUrl: "",
  photos: [],
  loading: false,
  saving: false,
  error: null,
  success: false,
};

describe("tela de edição de anúncio (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("exibe indicador de carregamento enquanto carrega anúncio", async () => {
    mockViewModel({
      ...loadedState,
      book: null,
      loading: true,
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.getByLabelText("Carregando anúncio")).toBeDefined();
    expect(screen.getByText("Carregando dados do anúncio…")).toBeDefined();
  });

  it("exibe mensagem de erro quando o anúncio não pode ser carregado", async () => {
    mockViewModel({
      ...loadedState,
      book: null,
      error: "Você só pode editar seus próprios anúncios.",
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.getByRole("alert").props.children).toBe(
      "Você só pode editar seus próprios anúncios.",
    );
  });

  it("renderiza cabeçalho e campos preenchidos", async () => {
    mockViewModel(loadedState);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.getByRole("header").props.children).toBe("Editar anúncio");
    expect(screen.getByDisplayValue("Livro Antigo")).toBeDefined();
    expect(screen.getByDisplayValue("Autor Antigo")).toBeDefined();
    expect(screen.getByDisplayValue("Romance")).toBeDefined();
    expect(screen.getByDisplayValue("30")).toBeDefined();
    expect(screen.getByDisplayValue("Centro")).toBeDefined();
  });

  it("permite alterar modalidade e oculta preço quando não é venda", async () => {
    mockViewModel({
      ...loadedState,
      modality: "donation",
      price: "",
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.queryByLabelText("Preço do livro")).toBeNull();
  });

  it("submete alterações e chama onSaved ao obter sucesso", async () => {
    const onSaved = vi.fn();
    const actions = mockViewModel(loadedState, {
      submit: vi.fn().mockResolvedValue(loadedState.book),
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <EditListing bookId="b1" sessionUserId="user-1" onSaved={onSaved} />,
      );
    });

    const submitBtn = screen.getByRole("button", { name: "Salvar alterações" });
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(actions.submit).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn();
    mockViewModel(loadedState);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <EditListing bookId="b1" sessionUserId="user-1" onCancel={onCancel} />,
      );
    });

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
