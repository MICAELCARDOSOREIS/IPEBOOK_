
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { CreateListingState } from "@/viewmodel/useCreateListingViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));

const mockActions = {
  loadDraft: vi.fn(),
  saveDraft: vi.fn(),
  reset: vi.fn(),
  setIsbn: vi.fn(),
  lookupIsbn: vi.fn(),
  handleBarcodeScanned: vi.fn(),
  setModality: vi.fn(),
  setTitle: vi.fn(),
  setAuthor: vi.fn(),
  setPrice: vi.fn(),
  setPhotoUrl: vi.fn(),
  addPhoto: vi.fn(),
  removePhoto: vi.fn(),
  setCondition: vi.fn(),
  setCategory: vi.fn(),
  setDescription: vi.fn(),
  setNeighborhood: vi.fn(),
  setIsBox: vi.fn(),
  setBoxVolumesCount: vi.fn(),
  submit: vi.fn(),
  saveForLater: vi.fn(),
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

vi.mock("@/viewmodel/useCreateListingViewModel", () => ({
  useCreateListingViewModel: () => [defaultState, mockActions],
}));

import CreateListing from "@/view/listings/createListing";

describe("CreateListing no Desktop Web (wideWeb = true)", () => {
  it("renderiza o stepper de desktop e os cards de modalidade", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<CreateListing sessionUserId="user-1" />);
    });

    expect(screen.getByText("1. Livro")).toBeDefined();
    expect(screen.getByText("2. Fotos")).toBeDefined();
    expect(screen.getByText("3. Detalhes")).toBeDefined();
    expect(screen.getByText("Etapa 1 de 3")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Venda")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Troca")).toBeDefined();
    expect(screen.getByLabelText("Modalidade Doação")).toBeDefined();
    expect(screen.getByText("PRÉVIA EM TEMPO REAL")).toBeDefined();
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
