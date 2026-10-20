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
    setCategory: vi.fn(),
    setModality: vi.fn(),
    setPrice: vi.fn(),
    setNeighborhood: vi.fn(),
    setCondition: vi.fn(),
    setDescription: vi.fn(),
    setPhotoUrl: vi.fn(),
    addPhoto: vi.fn(),
    removePhoto: vi.fn(),
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
  category: "",
  modality: "sale",
  price: "",
  neighborhood: "",
  condition: null,
  description: "",
  photoUrl: "",
  photos: [],
  loading: false,
  error: null,
  success: false,
};

async function renderScreen(props: Partial<React.ComponentProps<typeof CreateListing>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<CreateListing sessionUserId="user-1" {...props} />);
  });
  return screen;
}

async function goToStep(screen: Awaited<ReturnType<typeof render>>, step: 2 | 3) {
  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
  });
  if (step === 3) {
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Usar estas fotos" }));
    });
  }
}

describe("etapa 1 do anúncio — Livro (Figma 04.01)", () => {
  it("renderiza cabeçalho, indicador de etapa e campos do livro", async () => {
    mockViewModel(defaultState);
    const screen = await renderScreen();

    expect(screen.getByRole("header").props.children).toBe("Anunciar livro");
    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
    expect(screen.getByLabelText("Adicionar foto da capa")).toBeDefined();
    expect(screen.getByLabelText("Título")).toBeDefined();
    expect(screen.getByLabelText("Autor")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Venda")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Troca")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Doação")).toBeDefined();
  });

  it("exibe campo de preço apenas quando a modalidade é venda", async () => {
    mockViewModel({ ...defaultState, modality: "sale" });
    const venda = await renderScreen();
    expect(venda.getByLabelText("Preço (R$)")).toBeDefined();

    mockViewModel({ ...defaultState, modality: "donation" });
    const doacao = await renderScreen();
    expect(doacao.queryByLabelText("Preço (R$)")).toBeNull();
  });

  it("não publica o anúncio na primeira etapa", async () => {
    const actions = mockViewModel(defaultState);
    const screen = await renderScreen();

    expect(screen.queryByRole("button", { name: "Publicar anúncio" })).toBeNull();
    expect(actions.submit).not.toHaveBeenCalled();
  });

  it("chama onCancel ao voltar da primeira etapa", async () => {
    const onCancel = vi.fn();
    mockViewModel(defaultState);
    const screen = await renderScreen({ onCancel });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("etapa 2 do anúncio — Fotos (Figma 04.04)", () => {
  it("mostra os três lugares de foto e a dica", async () => {
    mockViewModel(defaultState);
    const screen = await renderScreen();
    await goToStep(screen, 2);

    expect(screen.getByText("Mostre seu livro.")).toBeDefined();
    expect(screen.getByText("Etapa 2 de 3")).toBeDefined();
    expect(screen.getByLabelText("Adicionar foto da capa")).toBeDefined();
    expect(screen.getByLabelText("Adicionar lombada")).toBeDefined();
    expect(screen.getByLabelText("Adicionar páginas")).toBeDefined();
    expect(screen.getByText("Dica de foto")).toBeDefined();
  });

  it("volta para a etapa anterior", async () => {
    mockViewModel(defaultState);
    const screen = await renderScreen();
    await goToStep(screen, 2);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar à etapa anterior" }));
    });

    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
  });
});

describe("etapa 3 do anúncio — Detalhes (Figma 04.05)", () => {
  it("oferece conservação, categoria, descrição com contador e bairros de Piripiri", async () => {
    mockViewModel({ ...defaultState, description: "Marcas leves" });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByText("Etapa 3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Conservação Bom estado")).toBeDefined();
    expect(screen.getByLabelText("Conservação Desgastado")).toBeDefined();
    expect(screen.getByLabelText("Categoria Literatura")).toBeDefined();
    expect(screen.getByLabelText("Descrição")).toBeDefined();
    expect(screen.getByText("12/280")).toBeDefined();
    expect(screen.getByLabelText("Bairro Centro")).toBeDefined();
  });

  it("registra a conservação escolhida", async () => {
    const actions = mockViewModel(defaultState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Conservação Com marcas"));
    });

    expect(actions.setCondition).toHaveBeenCalledWith("marked");
  });

  it("registra o bairro escolhido a partir da lista oficial", async () => {
    const actions = mockViewModel(defaultState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Bairro Paciência"));
    });

    expect(actions.setNeighborhood).toHaveBeenCalledWith("Paciência");
  });

  it("exibe indicador de carregamento enquanto publica", async () => {
    mockViewModel({ ...defaultState, loading: true });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByLabelText("Publicando")).toBeDefined();
  });

  it("exibe mensagem de erro quando a publicação falha", async () => {
    mockViewModel({ ...defaultState, error: "Sessão obrigatória para cadastrar anúncio." });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByRole("alert").props.children).toBe("Sessão obrigatória para cadastrar anúncio.");
  });
});

describe("anúncio publicado (Figma 04.07)", () => {
  it("mostra o livro, os próximos passos e as ações de saída", async () => {
    const onCreated = vi.fn();
    const onViewMyListings = vi.fn();
    const onGoHome = vi.fn();
    const actions = mockViewModel(defaultState, {
      submit: vi.fn().mockResolvedValue({
        id: "new-1",
        title: "Dom Casmurro",
        author: "Machado de Assis",
        ownerId: "user-1",
        modality: "sale",
        price: 25,
        status: "available",
      }),
    });

    const screen = await renderScreen({ onCreated, onViewMyListings, onGoHome });
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Publicar anúncio" }));
    });

    expect(actions.submit).toHaveBeenCalledWith("user-1");
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Seu livro ganhou um novo começo.")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Próximos passos")).toBeDefined();
    expect(screen.getByText("R$ 25.00")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Ver meus anúncios" }));
    });
    expect(onViewMyListings).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar ao início" }));
    });
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it("não mostra a tela de sucesso quando a publicação falha", async () => {
    mockViewModel(defaultState, { submit: vi.fn().mockResolvedValue(null) });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Publicar anúncio" }));
    });

    expect(screen.queryByText("Seu livro ganhou um novo começo.")).toBeNull();
  });
});
