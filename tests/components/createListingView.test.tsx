import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { within } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
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
    setIsbn: vi.fn(),
    lookupIsbn: vi.fn().mockResolvedValue(false),
    handleBarcodeScanned: vi.fn().mockResolvedValue(false),
    clearIsbnFeedback: vi.fn(),
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
    saveDraft: vi.fn().mockResolvedValue(undefined),
    loadDraft: vi.fn().mockResolvedValue(false),
    clearDraft: vi.fn().mockResolvedValue(undefined),
    saveForLater: vi.fn().mockResolvedValue(true),
    resumeDraft: vi.fn(),
    loadServerDraft: vi.fn().mockResolvedValue(null),
    submit: vi.fn().mockResolvedValue(null),
    reset: vi.fn(),
    ...actions,
  };
  mockedUseCreateListingViewModel.mockReturnValue([state, fullActions]);
  return fullActions;
}

const defaultState: CreateListingState = {
  isbn: "",
  lookingUpIsbn: false,
  isbnFeedback: null,
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
  draftId: null,
  loading: false,
  error: null,
  success: false,
};

/** Etapa 1 válida: o botão Continuar só avança com título, autor e preço da venda. */
const filledState: CreateListingState = {
  ...defaultState,
  title: "Dom Casmurro",
  author: "Machado de Assis",
  price: "25,00",
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

  it("mostra o resultado da busca por ISBN sem campo de código nem botão Buscar (Spec 058, Spec 091)", async () => {
    mockViewModel({
      ...defaultState,
      isbn: "9788535914849",
      isbnFeedback: { type: "success", message: 'Encontrado: "Dom Casmurro"!' },
    });
    const screen = await renderScreen();

    expect(screen.getByText('Encontrado: "Dom Casmurro"!')).toBeDefined();
    expect(screen.queryByLabelText("Código ISBN")).toBeNull();
    expect(screen.queryByLabelText("Buscar dados do livro pelo ISBN")).toBeNull();
  });

  it("exibe botão para escanear código de barras com a câmera (Spec 059 / Figma 04.01)", async () => {
    mockViewModel(defaultState);
    const screen = await renderScreen();

    const scanButton = screen.getByLabelText("Abrir leitor de código de barras pela câmera");
    expect(scanButton).toBeDefined();

    await act(async () => {
      fireEvent.press(scanButton);
    });

    // O modal deve ser aberto e exibir o título
    expect(screen.getByText("Escanear ISBN")).toBeDefined();
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
    mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 2);

    expect(screen.getByText("Mostre seu livro.")).toBeDefined();
    expect(screen.getByText("Etapa 2 de 3")).toBeDefined();
    expect(screen.getByLabelText("Adicionar foto da capa")).toBeDefined();
    expect(screen.getByLabelText("Adicionar lombada")).toBeDefined();
    expect(screen.getByLabelText("Adicionar páginas")).toBeDefined();
    // Spec 043 RN-07: capa em destaque (dois terços), lombada e páginas empilhadas ao lado.
    const flatten = (style: unknown): Record<string, unknown> =>
      Array.isArray(style) ? Object.assign({}, ...style.flat(Infinity).filter(Boolean)) : (style as Record<string, unknown>);
    expect(flatten(screen.getByLabelText("Adicionar foto da capa").props.style).flex).toBe(2);
    const spine = screen.getByLabelText("Adicionar lombada");
    expect(within(spine.parent!).getByLabelText("Adicionar páginas")).toBeDefined();
    expect(within(spine.parent!).queryByLabelText("Adicionar foto da capa")).toBeNull();
    expect(screen.getByText("Dica de foto")).toBeDefined();
  });

  it("volta para a etapa anterior", async () => {
    mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 2);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar à etapa anterior" }));
    });

    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
  });
});

describe("etapa 3 do anúncio — Detalhes (Figma 04.05)", () => {
  it("oferece conservação, categoria, descrição com contador e bairro de Piripiri", async () => {
    mockViewModel({ ...filledState, description: "Marcas leves" });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByText("Etapa 3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Conservação Bom estado")).toBeDefined();
    expect(screen.getByLabelText("Conservação Desgastado")).toBeDefined();
    expect(screen.getByLabelText("Categoria Literatura")).toBeDefined();
    expect(screen.getByLabelText("Descrição")).toBeDefined();
    // Spec 043 RN-08: um único contador, sem o "Restam n caracteres" repetido.
    expect(screen.getByText("12/280")).toBeDefined();
    expect(screen.queryByText(/Restam/)).toBeNull();
    expect(screen.getByLabelText("Descrição").props.multiline).toBe(true);
    // Figma `04.05` (nó `99:2259`): bairro como campo que abre o seletor, não 17 chips.
    expect(screen.getByLabelText("Selecionar bairro para retirada em Piripiri")).toBeDefined();
    expect(screen.getByText("Só o bairro aparece no anúncio.")).toBeDefined();
  });

  it("exibe banner de rascunho salvo e permite limpar rascunho (Issue #160)", async () => {
    const actions = mockViewModel({ ...defaultState, title: "Capitães da Areia" });
    const screen = await renderScreen();

    expect(screen.getByText("Rascunho salvo neste aparelho")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Limpar rascunho" }));
    });
    expect(actions.reset).toHaveBeenCalledTimes(1);
  });

  it("exibe aviso quando a descrição ultrapassa 280 caracteres (Issue #160)", async () => {
    mockViewModel({ ...filledState, description: "a".repeat(285) });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByText("A descrição deve ter no máximo 280 caracteres.")).toBeDefined();
  });

  it("registra a conservação escolhida", async () => {
    const actions = mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Conservação Com marcas"));
    });

    expect(actions.setCondition).toHaveBeenCalledWith("marked");
  });

  it("registra o bairro escolhido no seletor de bairros de Piripiri", async () => {
    const actions = mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Selecionar bairro para retirada em Piripiri"));
    });
    expect(screen.getByText("Escolha seu bairro")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Selecionar bairro Paciência"));
    });

    expect(actions.setNeighborhood).toHaveBeenCalledWith("Paciência");
    // O seletor fecha após a escolha; o campo passa a exibir o bairro escolhido no estado.
    expect(screen.queryByText("Escolha seu bairro")).toBeNull();
  });

  it("permite limpar o bairro selecionado", async () => {
    const actions = mockViewModel({ ...filledState, neighborhood: "Centro" });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByLabelText("Bairro para retirada: Centro. Alterar bairro")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar bairro selecionado"));
    });

    expect(actions.setNeighborhood).toHaveBeenCalledWith("");
  });

  it("mantém as ações da etapa na barra fixa inferior", async () => {
    mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    const publish = screen.getByRole("button", { name: "Publicar anúncio" });
    expect(publish).toBeDefined();
    // "Voltar à etapa anterior" fica na mesma barra e a navegação do cabeçalho também recua.
    expect(screen.getByRole("button", { name: "Voltar à etapa anterior" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Continuar" })).toBeNull();
  });

  it("exibe indicador de carregamento enquanto publica", async () => {
    mockViewModel({ ...filledState, loading: true });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByLabelText("Publicando")).toBeDefined();
  });

  it("exibe mensagem de erro quando a publicação falha", async () => {
    mockViewModel({ ...filledState, error: "Sessão obrigatória para cadastrar anúncio." });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByRole("alert").props.children).toBe("Sessão obrigatória para cadastrar anúncio.");
  });

  it("anuncia o erro para leitores de tela quando a publicação falha (Spec 042 / Issue #147)", async () => {
    const announceSpy = vi.spyOn(AccessibilityInfo, "announceForAccessibility");
    mockViewModel({ ...filledState, error: "Sessão obrigatória para cadastrar anúncio." });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    const errorText = screen.getByRole("alert");
    expect(errorText.props.accessibilityLiveRegion).toBe("assertive");
    expect(announceSpy).toHaveBeenCalledWith("Sessão obrigatória para cadastrar anúncio.");

    announceSpy.mockRestore();
  });
});

describe("anúncio publicado (Figma 04.07)", () => {
  it("mostra o livro, os próximos passos e as ações de saída", async () => {
    const onCreated = vi.fn();
    const onViewMyListings = vi.fn();
    const onGoHome = vi.fn();
    const actions = mockViewModel(filledState, {
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
    // Spec 043 RN-09: manchete com realce em "um novo começo." e ação "Ver estante" (`04.07`).
    expect(screen.getByRole("header", { name: "Seu livro ganhou um novo começo." })).toBeDefined();
    expect(screen.getByText("um novo começo.")).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("Próximos passos")).toBeDefined();
    expect(screen.getByText("R$ 25,00")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Ver estante" }));
    });
    expect(onViewMyListings).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar ao início" }));
    });
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it("não mostra a tela de sucesso quando a publicação falha", async () => {
    mockViewModel(filledState, { submit: vi.fn().mockResolvedValue(null) });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Publicar anúncio" }));
    });

    expect(screen.queryByRole("header", { name: "Seu livro ganhou um novo começo." })).toBeNull();
  });
});

describe("persistência e recuperação de rascunhos na UI (Spec 017 / Spec 072)", () => {
  it("não avança e mostra o erro em cada campo quando a etapa 1 está incompleta", async () => {
    const actions = mockViewModel({ ...defaultState, modality: "sale" });
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
    });

    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
    expect(screen.getByText("Informe o título do livro.")).toBeDefined();
    expect(screen.getByText("Informe o autor do livro.")).toBeDefined();
    expect(screen.getByText("Informe um preço maior que zero.")).toBeDefined();
    expect(actions.saveDraft).not.toHaveBeenCalled();
  });

  it("não mostra erros de campo antes da primeira tentativa de avançar", async () => {
    mockViewModel(defaultState);
    const screen = await renderScreen();

    expect(screen.queryByText("Informe o título do livro.")).toBeNull();
  });

  it("dispara actions.loadDraft na montagem se o formulário estiver limpo", async () => {
    const actions = mockViewModel(defaultState);
    await renderScreen();

    expect(actions.loadDraft).toHaveBeenCalledTimes(1);
  });

  it("salva o rascunho ao avançar da etapa 1 para a etapa 2 via botão Continuar", async () => {
    const actions = mockViewModel(filledState);
    const screen = await renderScreen();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
    });

    expect(actions.saveDraft).toHaveBeenCalled();
    expect(screen.getByText("Etapa 2 de 3")).toBeDefined();
  });

  it("salva o rascunho ao avançar da etapa 2 para a etapa 3 via botão Usar estas fotos", async () => {
    const actions = mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 2);

    expect(actions.saveDraft).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Usar estas fotos" }));
    });

    expect(actions.saveDraft).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Etapa 3 de 3")).toBeDefined();
  });

  it("permite descartar o rascunho salvo limpando os dados e resetando para a etapa 1", async () => {
    const actions = mockViewModel({ ...defaultState, title: "O Quinze", author: "Rachel de Queiroz" });
    const screen = await renderScreen();

    expect(screen.getByText("Rascunho salvo neste aparelho")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Limpar rascunho" }));
    });

    expect(actions.reset).toHaveBeenCalledTimes(1);
  });
});
