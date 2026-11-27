import type React from "react";
import { act, fireEvent, render, within } from "@testing-library/react-native";
import { AccessibilityInfo, Platform, StyleSheet } from "react-native";
import * as container from "@/di/container";
import * as useIsWideWebModule from "@/view/useIsWideWeb";
import type { CreateListingState, CreateListingActions } from "@/viewmodel/useCreateListingViewModel";
import CreateListing from "@/view/listings/createListing";

jest.mock("@/viewmodel/useCreateListingViewModel", () => ({
  useCreateListingViewModel: jest.fn(),
}));

import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";
const mockedUseCreateListingViewModel = jest.mocked(useCreateListingViewModel);

function mockViewModel(state: CreateListingState, actions: Partial<CreateListingActions> = {}) {
  const fullActions: CreateListingActions = {
    setIsbn: jest.fn(),
    lookupIsbn: jest.fn().mockResolvedValue(false),
    handleBarcodeScanned: jest.fn().mockResolvedValue(false),
    clearIsbnFeedback: jest.fn(),
    setTitle: jest.fn(),
    setAuthor: jest.fn(),
    setCategory: jest.fn(),
    setModality: jest.fn(),
    setPrice: jest.fn(),
    setNeighborhood: jest.fn(),
    setCondition: jest.fn(),
    setDescription: jest.fn(),
    setPhotoUrl: jest.fn(),
    addPhoto: jest.fn(),
    setPhotoAt: jest.fn(),
    removePhoto: jest.fn(),
    setIsBox: jest.fn(),
    setBoxVolumesCount: jest.fn(),
    saveDraft: jest.fn().mockResolvedValue(undefined),
    loadDraft: jest.fn().mockResolvedValue(false),
    clearDraft: jest.fn().mockResolvedValue(undefined),
    saveForLater: jest.fn().mockResolvedValue(true),
    resumeDraft: jest.fn(),
    loadServerDraft: jest.fn().mockResolvedValue(null),
    submit: jest.fn().mockResolvedValue(null),
    reset: jest.fn(),
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
  edition: {},
  isBox: false,
  boxVolumesCount: "",
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
  it("oculta o campo manual de ISBN no iOS", async () => {
    const originalOs = Platform.OS;
    mockViewModel({ ...filledState, isbn: "9788535914849" });
    try {
      Platform.OS = "ios";
      const iosScreen = await renderScreen();
      expect(iosScreen.queryByLabelText("ISBN (opcional)")).toBeNull();
      expect(iosScreen.queryByRole("button", { name: "Buscar pelo ISBN" })).toBeNull();
      const notaProximasEtapas = iosScreen.getByText("Conservação e local de retirada vêm nas próximas etapas.");
      expect(StyleSheet.flatten(notaProximasEtapas.props.style)).toMatchObject({
        flex: 1,
        flexShrink: 1,
      });
    } finally {
      Platform.OS = originalOs;
    }
  });

  it("oculta o campo manual de ISBN no Android", async () => {
    const originalOs = Platform.OS;
    mockViewModel({ ...filledState, isbn: "9788535914849" });
    try {
      Platform.OS = "android";
      const androidScreen = await renderScreen();
      expect(androidScreen.queryByLabelText("ISBN (opcional)")).toBeNull();
      expect(androidScreen.queryByRole("button", { name: "Buscar pelo ISBN" })).toBeNull();
    } finally {
      Platform.OS = originalOs;
    }
  });

  it("exibe o campo manual de ISBN apenas na Web e permite buscar", async () => {
    const originalOs = Platform.OS;
    const actions = mockViewModel({ ...filledState, isbn: "9788535914849" });
    try {
      Platform.OS = "web";
      const webScreen = await renderScreen();
      const isbn = webScreen.getByLabelText("ISBN (opcional)");
      expect(isbn.props.keyboardType).toBe("number-pad");
      await act(async () => {
        fireEvent.press(webScreen.getByRole("button", { name: "Buscar pelo ISBN" }));
      });
      expect(actions.lookupIsbn).toHaveBeenCalledTimes(1);
    } finally {
      Platform.OS = originalOs;
    }
  });

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
    const onCancel = jest.fn();
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
    expect(screen.getByLabelText("Adicionar verso")).toBeDefined();
    // Spec 043 RN-07: capa em destaque (dois terços), lombada e verso empilhados ao lado.
    const flatten = (style: unknown): Record<string, unknown> =>
      Array.isArray(style) ? Object.assign({}, ...style.flat(Infinity).filter(Boolean)) : (style as Record<string, unknown>);
    expect(flatten(screen.getByLabelText("Adicionar foto da capa").props.style).flex).toBe(2);
    const sideSlots = within(screen.getByTestId("step2-side-slots"));
    expect(sideSlots.getByLabelText("Adicionar lombada")).toBeDefined();
    expect(sideSlots.getByLabelText("Adicionar verso")).toBeDefined();
    expect(sideSlots.queryByLabelText("Adicionar foto da capa")).toBeNull();
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
  it("oferece conservação, categoria e descrição com contador", async () => {
    mockViewModel({ ...filledState, description: "Marcas leves" });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByText("Etapa 3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Conservação Bom estado")).toBeDefined();
    expect(screen.getByLabelText("Conservação Desgastado")).toBeDefined();
    expect(screen.getByLabelText("Categoria Literatura & Romance")).toBeDefined();
    expect(screen.getByLabelText("Descrição")).toBeDefined();
    // Spec 043 RN-08: um único contador, sem o "Restam n caracteres" repetido.
    expect(screen.getByText("12/280")).toBeDefined();
    expect(screen.queryByText(/Restam/)).toBeNull();
    expect(screen.getByLabelText("Descrição").props.multiline).toBe(true);
    // Bairro para retirada removido conforme simplificação da etapa 3.
    expect(screen.queryByLabelText("Selecionar bairro para retirada em Piripiri")).toBeNull();
    expect(screen.queryByText("Só o bairro aparece no anúncio.")).toBeNull();
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

  it("renderiza campos de conservação, categoria, box e descrição na etapa 3 sem campo de bairro", async () => {
    mockViewModel(filledState);
    const screen = await renderScreen();
    await goToStep(screen, 3);

    expect(screen.getByText("Conservação")).toBeDefined();
    expect(screen.getByText("Categoria")).toBeDefined();
    expect(screen.getByText("Box ou coleção de livros")).toBeDefined();
    expect(screen.getByLabelText("Descrição")).toBeDefined();
    expect(screen.queryByLabelText("Selecionar bairro para retirada em Piripiri")).toBeNull();
    expect(screen.queryByText("Bairro para retirada")).toBeNull();
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
    const announceSpy = jest.spyOn(AccessibilityInfo, "announceForAccessibility");
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
    const onCreated = jest.fn();
    const onViewMyListings = jest.fn();
    const onGoHome = jest.fn();
    const actions = mockViewModel(filledState, {
      submit: jest.fn().mockResolvedValue({
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
    mockViewModel(filledState, { submit: jest.fn().mockResolvedValue(null) });
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

  it("aciona foco, submitEditing, scanner ISBN e remoção de foto na etapa 1", async () => {
    const actions = mockViewModel({
      ...filledState,
      photoUrl: "https://cdn.ipebook.app/capa.jpg",
    });
    const screen = await renderScreen();

    const titleField = screen.getByLabelText("Título");
    const authorField = screen.getByLabelText("Autor");
    const priceField = screen.getByLabelText("Preço (R$)");

    await act(async () => {
      fireEvent(titleField, "focus");
      fireEvent(titleField, "submitEditing");
      fireEvent(authorField, "focus");
      fireEvent(authorField, "submitEditing");
      fireEvent(priceField, "focus");
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Abrir leitor de código de barras pela câmera" }));
    });
    expect(screen.getByRole("button", { name: "Fechar leitor de código de barras" })).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Fechar leitor de código de barras" }));
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Remover foto da capa" }));
    });
    expect(actions.setPhotoUrl).toHaveBeenCalledWith("");
  });

  it("abre etapa 2 pelo card de capa, escolhe foto por câmera/galeria e salva rascunho para depois", async () => {
    const choose = jest
      .fn()
      .mockResolvedValueOnce("https://cdn.ipebook.app/capa-camera.jpg")
      .mockResolvedValueOnce("https://cdn.ipebook.app/extra-galeria.jpg")
      .mockResolvedValueOnce("https://cdn.ipebook.app/extra-galeria.jpg");
    const photoSpy = jest
      .spyOn(container, "makeListingPhotoViewModel")
      .mockReturnValue([{ uploading: false, error: null }, { choose, clearError: jest.fn() }]);

    try {
      const actions = mockViewModel(filledState);
      const screen = await renderScreen();

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Adicionar foto da capa"));
      });
      expect(screen.getByText("Etapa 2 de 3")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Adicionar foto da capa"));
      });
      await act(async () => {
        fireEvent.press(screen.getByLabelText("Tirar foto com a câmera"));
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Permitir e escolher" }));
      });
      expect(choose).toHaveBeenCalledWith("camera", "cover");
      expect(actions.setPhotoUrl).toHaveBeenCalledWith("https://cdn.ipebook.app/capa-camera.jpg");

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Adicionar lombada"));
      });
      await act(async () => {
        fireEvent.press(screen.getByLabelText("Escolher foto da galeria"));
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Permitir e escolher" }));
      });
      expect(choose).toHaveBeenCalledWith("library", "spine");
      expect(actions.setPhotoAt).toHaveBeenCalledWith(0, "https://cdn.ipebook.app/extra-galeria.jpg");

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Adicionar verso"));
      });
      await act(async () => {
        fireEvent.press(screen.getByLabelText("Escolher foto da galeria"));
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Permitir e escolher" }));
      });
      expect(choose).toHaveBeenCalledWith("library", "back");
      expect(actions.setPhotoAt).toHaveBeenCalledWith(1, "https://cdn.ipebook.app/extra-galeria.jpg");

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar rascunho para depois" }));
      });
      expect(actions.saveForLater).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar rascunho" }));
      });
      expect(actions.saveForLater).toHaveBeenCalledTimes(1);
    } finally {
      photoSpy.mockRestore();
    }
  });

  it("aciona categoria, box/coleção, volumes, local de retirada e foco na descrição na etapa 3", async () => {
    const actions = mockViewModel({
      ...filledState,
      category: "Literatura & Romance",
      neighborhood: "Campus IFPI Piripiri",
      isBox: true,
      boxVolumesCount: "2",
    });
    const screen = await renderScreen();
    await goToStep(screen, 3);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Categoria Literatura & Romance"));
      fireEvent.press(screen.getByLabelText("Categoria Didáticos & Concursos"));
      fireEvent.press(screen.getByLabelText("Box ou coleção de livros"));
      fireEvent.changeText(screen.getByLabelText("Volumes (opcional)"), "4");
      fireEvent.press(screen.getByLabelText("Local de retirada Campus IFPI Piripiri"));
      fireEvent.press(screen.getByLabelText("Local de retirada Praça da Bandeira"));
      fireEvent(screen.getByLabelText("Descrição"), "focus");
    });

    expect(actions.setCategory).toHaveBeenCalledWith("");
    expect(actions.setCategory).toHaveBeenCalledWith("Didáticos & Concursos");
    expect(actions.setIsBox).toHaveBeenCalledWith(false);
    expect(actions.setBoxVolumesCount).toHaveBeenCalledWith("4");
    expect(actions.setNeighborhood).toHaveBeenCalledWith("Piripiri");
    expect(actions.setNeighborhood).toHaveBeenCalledWith("Praça da Bandeira");
  });

  it("exibe ações de desktop na web larga e permite salvar para depois, voltar e publicar", async () => {
    const wideSpy = jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(true);
    try {
      const actions = mockViewModel(filledState);
      const screen = await renderScreen();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar para depois" }));
      });
      expect(actions.saveForLater).toHaveBeenCalledTimes(1);

      await goToStep(screen, 3);
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Voltar à etapa anterior" }));
      });
      expect(screen.getByText("Etapa 2 de 3")).toBeDefined();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Usar estas fotos" }));
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Publicar anúncio" }));
      });
      expect(actions.submit).toHaveBeenCalledTimes(1);
    } finally {
      wideSpy.mockRestore();
    }
  });

  it("permite salvar rascunho localmente quando está sem conexão, limpa aviso no botão Limpar e na reconexão", async () => {
    const netSpy = jest.spyOn(container, "makeNetworkStatus").mockReturnValue({ isOnline: false });
    try {
      const actions = mockViewModel(filledState);
      const screen = await renderScreen();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar rascunho para depois" }));
      });
      expect(
        screen.getByText("Sem internet agora: o rascunho ficará salvo neste aparelho para você continuar depois."),
      ).toBeDefined();
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar rascunho" }));
      });

      expect(actions.saveDraft).toHaveBeenCalled();
      expect(actions.saveForLater).not.toHaveBeenCalled();
      expect(
        screen.getByText("Rascunho salvo neste aparelho. Conecte-se para publicar ou sincronizar."),
      ).toBeDefined();

      // Clicar em Limpar deve apagar o aviso de rascunho salvo localmente.
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Limpar rascunho" }));
      });
      expect(actions.reset).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByText("Rascunho salvo neste aparelho. Conecte-se para publicar ou sincronizar."),
      ).toBeNull();
    } finally {
      netSpy.mockRestore();
    }
  });

  it("salva rascunho direto sem diálogo na web larga offline e limpa aviso ao reconectar", async () => {
    const wideSpy = jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(true);
    let online = false;
    const netSpy = jest.spyOn(container, "makeNetworkStatus").mockImplementation(() => ({ isOnline: online }));
    try {
      const actions = mockViewModel(filledState);
      const screen = await renderScreen();

      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Salvar para depois" }));
      });
      expect(actions.saveDraft).toHaveBeenCalled();
      expect(actions.saveForLater).not.toHaveBeenCalled();
      expect(
        screen.getByText("Rascunho salvo neste aparelho. Conecte-se para publicar ou sincronizar."),
      ).toBeDefined();

      online = true;
      await screen.rerender(
        <CreateListing
          sessionUserId="user-1"
          onCreated={jest.fn()}
          onCancel={jest.fn()}
          onViewMyListings={jest.fn()}
          onGoHome={jest.fn()}
        />,
      );
      expect(
        screen.queryByText("Rascunho salvo neste aparelho. Conecte-se para publicar ou sincronizar."),
      ).toBeNull();
    } finally {
      wideSpy.mockRestore();
      netSpy.mockRestore();
    }
  });
});
