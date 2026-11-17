
import { act, fireEvent, render } from "@testing-library/react-native";
import type { CreateListingState } from "@/viewmodel/useCreateListingViewModel";

jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));

const mockActions = {
  loadDraft: jest.fn(),
  saveDraft: jest.fn(),
  reset: jest.fn(),
  setIsbn: jest.fn(),
  lookupIsbn: jest.fn(),
  handleBarcodeScanned: jest.fn(),
  setModality: jest.fn(),
  setTitle: jest.fn(),
  setAuthor: jest.fn(),
  setPrice: jest.fn(),
  setPhotoUrl: jest.fn(),
  addPhoto: jest.fn(),
  removePhoto: jest.fn(),
  setCondition: jest.fn(),
  setCategory: jest.fn(),
  setDescription: jest.fn(),
  setNeighborhood: jest.fn(),
  setIsBox: jest.fn(),
  setBoxVolumesCount: jest.fn(),
  submit: jest.fn(),
  saveForLater: jest.fn(),
};

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

jest.mock("@/viewmodel/useCreateListingViewModel", () => ({
  useCreateListingViewModel: () => [defaultState, mockActions],
}));

import CreateListing from "@/view/listings/createListing";

describe("CreateListing no Desktop Web (wideWeb = true)", () => {
  it("renderiza o stepper de desktop e os cards de modalidade", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });

    expect(screen.getByText("Livro")).toBeDefined();
    expect(screen.getByText("Fotos")).toBeDefined();
    expect(screen.getByText("Detalhes")).toBeDefined();
    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Venda")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Troca")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Doação")).toBeDefined();
    expect(screen.getByText("Prévia")).toBeDefined();
    expect(screen.getByText("O título aparece aqui")).toBeDefined();
    expect(screen.queryByText("Título do livro")).toBeNull();
    expect(screen.getByText("Salvar para depois")).toBeDefined();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDefined();

    // Dispara a escolha de Troca e Doação
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Modalidade Troca"));
    });
    expect(mockActions.setModality).toHaveBeenCalledWith("trade");

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Modalidade Doação"));
    });
    expect(mockActions.setModality).toHaveBeenCalledWith("donation");
  });
});
