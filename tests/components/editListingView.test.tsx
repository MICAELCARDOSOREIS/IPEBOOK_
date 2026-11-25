
import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import * as container from "@/di/container";
import type { EditListingState, EditListingActions } from "@/viewmodel/useEditListingViewModel";
import EditListing from "@/view/listings/editListing";

jest.mock("@/viewmodel/useEditListingViewModel", () => ({
  useEditListingViewModel: jest.fn(),
}));

import { useEditListingViewModel } from "@/viewmodel/useEditListingViewModel";
const mockedUseEditListingViewModel = jest.mocked(useEditListingViewModel);

function mockViewModel(state: EditListingState, actions: Partial<EditListingActions> = {}) {
  const fullActions: EditListingActions = {
    load: jest.fn().mockResolvedValue(undefined),
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
    submit: jest.fn().mockResolvedValue(null),
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
  condition: "good",
  description: "Marcas leves",
  photoUrl: "",
  photos: [],
  isBox: false,
  boxVolumesCount: "",
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
    expect(screen.getByDisplayValue("30")).toBeDefined();
    expect(screen.getByDisplayValue("Marcas leves")).toBeDefined();
    expect(screen.getByLabelText("Categoria Romance").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Conservação Bom estado").props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Ponto de encontro Praça da Bandeira").props.accessibilityState.checked).toBe(false);
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
    const onSaved = jest.fn();
    const actions = mockViewModel(loadedState, {
      submit: jest.fn().mockResolvedValue(loadedState.book),
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
    const onCancel = jest.fn();
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

describe("Spec 030 — edição alinhada ao Figma 04.09", () => {
  it("desmarca categoria, conservação e local ao tocar no chip já escolhido", async () => {
    const actions = mockViewModel({ ...loadedState, neighborhood: "Praça da Bandeira" });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Categoria Romance"));
      fireEvent.press(screen.getByLabelText("Conservação Bom estado"));
      fireEvent.press(screen.getByLabelText("Ponto de encontro Praça da Bandeira"));
    });

    expect(actions.setCategory).toHaveBeenCalledWith("");
    expect(actions.setCondition).toHaveBeenCalledWith(null);
    expect(actions.setNeighborhood).toHaveBeenCalledWith("Piripiri");
  });

  it("escolhe outra conservação e outro ponto de encontro", async () => {
    const actions = mockViewModel(loadedState);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Conservação Desgastado"));
      fireEvent.press(screen.getByLabelText("Ponto de encontro Praça da Bandeira"));
      fireEvent.press(screen.getByLabelText("Categoria Infantil & Quadrinhos"));
    });

    expect(actions.setCondition).toHaveBeenCalledWith("worn");
    expect(actions.setNeighborhood).toHaveBeenCalledWith("Praça da Bandeira");
    expect(actions.setCategory).toHaveBeenCalledWith("Infantil & Quadrinhos");
  });

  it("mostra a mensagem de sucesso depois de salvar", async () => {
    mockViewModel({ ...loadedState, success: true });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.getByText("Anúncio atualizado com sucesso!")).toBeDefined();
  });

  it("exibe contador regressivo de caracteres da descrição e alerta se exceder 280 (Issue #160)", async () => {
    mockViewModel({ ...loadedState, description: "Marcas leves" });

    let screenValid!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screenValid = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });
    expect(screenValid.getByText("12/280")).toBeDefined();
    expect(screenValid.getByText("Restam 268 caracteres")).toBeDefined();

    mockViewModel({ ...loadedState, description: "a".repeat(282) });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    expect(screen.getByText("Limite excedido em 2 caracteres")).toBeDefined();
    expect(screen.getByText("A descrição deve ter no máximo 280 caracteres.")).toBeDefined();
  });

  it("linha de categorias quebra os chips em telas estreitas (Spec 125 D3)", async () => {
    mockViewModel(loadedState);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
    });

    const row = StyleSheet.flatten(screen.getByTestId("edit-listing-category-row").props.style);
    expect(row.flexWrap).toBe("wrap");
  });

  it("aciona foto, campos de foco/submit e troca de modalidade na edição", async () => {
    const actions = mockViewModel({
      ...loadedState,
      photoUrl: "https://cdn.ipebook.app/antiga.jpg",
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<EditListing bookId="b1" sessionUserId="user-1" onCancel={jest.fn()} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Remover foto da capa" }));
    });
    expect(actions.setPhotoUrl).toHaveBeenCalledWith("");

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Alterar foto da capa" }));
    });
    expect(screen.getByLabelText("Escolher foto da galeria")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Fechar ao tocar fora" }));
    });
    expect(screen.getByLabelText("URL da foto da capa")).toBeDefined();

    await act(async () => {
      fireEvent(screen.getByLabelText("Título do livro"), "focus");
      fireEvent(screen.getByLabelText("Título do livro"), "submitEditing");
      fireEvent(screen.getByLabelText("Autor do livro"), "focus");
      fireEvent(screen.getByLabelText("Autor do livro"), "submitEditing");
      fireEvent(screen.getByLabelText("Descrição"), "focus");
      fireEvent(screen.getByLabelText("Preço do livro"), "focus");
      fireEvent.press(screen.getByLabelText("Modalidade Troca"));
    });

    expect(actions.setModality).toHaveBeenCalledWith("trade");
  });

  it("permite adicionar e remover fotos da lombada e do verso na tela Editar anúncio", async () => {
    const choose = jest
      .fn()
      .mockResolvedValueOnce("https://cdn.ipebook.app/foto-lombada-1.jpg")
      .mockResolvedValueOnce("https://cdn.ipebook.app/foto-verso-1.jpg");
    const photoSpy = jest
      .spyOn(container, "makeListingPhotoViewModel")
      .mockReturnValue([{ uploading: false, error: null }, { choose, clearError: jest.fn() }]);

    try {
      const actions = mockViewModel({
        ...loadedState,
        photoUrl: "https://cdn.ipebook.app/capa.jpg",
        photos: [],
      });

      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<EditListing bookId="b1" sessionUserId="user-1" />);
      });

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
      expect(actions.setPhotoAt).toHaveBeenCalledWith(0, "https://cdn.ipebook.app/foto-lombada-1.jpg");

      await act(async () => {
        fireEvent.press(screen.getByLabelText("Adicionar verso"));
      });
      await act(async () => {
        fireEvent.press(screen.getByLabelText("Tirar foto com a câmera"));
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Permitir e escolher" }));
      });
      expect(choose).toHaveBeenCalledWith("camera", "back");
      expect(actions.setPhotoAt).toHaveBeenCalledWith(1, "https://cdn.ipebook.app/foto-verso-1.jpg");

      // Remoção limpa cada slot independentemente
      const filledActions = mockViewModel({
        ...loadedState,
        photoUrl: "https://cdn.ipebook.app/capa.jpg",
        photos: ["https://cdn.ipebook.app/foto-lombada-1.jpg", "https://cdn.ipebook.app/foto-verso-1.jpg"],
      });
      await act(async () => {
        screen.rerender(<EditListing bookId="b1" sessionUserId="user-1" />);
      });
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Remover lombada" }));
        fireEvent.press(screen.getByRole("button", { name: "Remover verso" }));
      });
      expect(filledActions.setPhotoAt).toHaveBeenCalledWith(0, "");
      expect(filledActions.setPhotoAt).toHaveBeenCalledWith(1, "");
    } finally {
      photoSpy.mockRestore();
    }
  });
});
