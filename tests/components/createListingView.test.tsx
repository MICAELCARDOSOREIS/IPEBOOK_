import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { CreateListingState, CreateListingActions } from "@/viewmodel/useCreateListingViewModel";
import CreateListing from "@/view/listings/createListing";

vi.mock("@/viewmodel/useCreateListingViewModel", () => ({
  useCreateListingViewModel: vi.fn(),
}));

import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
const mockedUseCreateListingViewModel = vi.mocked(useCreateListingViewModel);

function mockViewModel(state: CreateListingState, actions: Partial<CreateListingActions> = {}) {
  const fullActions: CreateListingActions = {
    setTitle: vi.fn(),
    setAuthor: vi.fn(),
    setModality: vi.fn(),
    setPrice: vi.fn(),
    submit: vi.fn().mockResolvedValue(null),
    reset: vi.fn(),
    ...actions,
  };
  mockedUseCreateListingViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

const defaultState: CreateListingState = {
  title: "",
  author: "",
  modality: "sale",
  price: "",
  loading: false,
  error: null,
  success: false,
};

describe("tela de cadastro de anúncio (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("renderiza cabeçalho e campos obrigatórios", async () => {
    mockViewModel(defaultState);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });

    expect(screen.getByRole("header").props.children).toBe("Anunciar livro");
    expect(screen.getByLabelText("Título do livro")).toBeDefined();
    expect(screen.getByLabelText("Autor do livro")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Venda")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Troca")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Doação")).toBeDefined();
  });

  it("exibe campo de preço apenas quando modalidade é venda", async () => {
    mockViewModel({ ...defaultState, modality: "sale" });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });
    expect(screen.getByLabelText("Preço do livro")).toBeDefined();
  });

  it("oculta campo de preço para doação e troca", async () => {
    mockViewModel({ ...defaultState, modality: "donation" });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });
    expect(screen.queryByLabelText("Preço do livro")).toBeNull();
  });

  it("exibe indicador de carregamento enquanto cadastra", async () => {
    mockViewModel({ ...defaultState, loading: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });
    expect(screen.getByLabelText("Cadastrando")).toBeDefined();
  });

  it("exibe mensagem de erro quando há falha", async () => {
    mockViewModel({ ...defaultState, error: "Sessão obrigatória para cadastrar anúncio." });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });
    expect(screen.getByRole("alert").props.children).toBe("Sessão obrigatória para cadastrar anúncio.");
  });

  it("exibe mensagem de sucesso após cadastro", async () => {
    mockViewModel({ ...defaultState, success: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });
    expect(screen.getByText("Anúncio cadastrado com sucesso!")).toBeDefined();
  });

  it("chama onCreated após cadastro bem-sucedido", async () => {
    const onCreated = vi.fn();
    const actions = mockViewModel(defaultState, {
      submit: vi.fn().mockResolvedValue({ id: "new-1" }),
    });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" onCreated={onCreated} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Cadastrar anúncio"));
    });

    expect(actions.submit).toHaveBeenCalledWith("user-1");
    expect(onCreated).toHaveBeenCalled();
  });

  it("renderiza botão cancelar quando onCancel é fornecido", async () => {
    const onCancel = vi.fn();
    mockViewModel(defaultState);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" onCancel={onCancel} />);
    });

    const cancelButton = screen.getByText("Cancelar");
    expect(cancelButton).toBeDefined();

    await act(async () => {
      fireEvent.press(cancelButton);
    });
    expect(onCancel).toHaveBeenCalled();
  });
});
