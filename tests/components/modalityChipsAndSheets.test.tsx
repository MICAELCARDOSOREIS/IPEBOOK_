
import { act, fireEvent, render } from "@testing-library/react-native";
import { Chip } from "@/view/components/Chip";
import { ModalityCoverArea } from "@/view/components/ModalityCoverArea";
import { PhotoSourceSheet } from "@/view/components/PhotoSourceSheet";
import { CreateListingStep1 } from "@/view/listings/createListingStep1";
import { CreateListingStep2 } from "@/view/listings/createListingStep2";

const tone = { background: "#F8D88A", text: "#3A2A10" };

describe("Chip com cor própria (Spec 091)", () => {
  it("selecionado usa o texto da cor e não mostra o pontinho; desmarcado e desativado mostra", async () => {
    const selected = await render(<Chip label="Troca" selected tone={tone} onPress={() => {}} />);
    expect(selected.getByText("Troca")).toBeDefined();
    const idle = await render(<Chip label="Venda" selected={false} tone={tone} disabled onPress={() => {}} />);
    expect(idle.getByRole("checkbox").props.accessibilityState).toMatchObject({ checked: false, disabled: true });
  });
});

describe("ModalityCoverArea e PhotoSourceSheet", () => {
  it("envolve a capa e usa o título padrão da folha de fotos", async () => {
    const area = await render(<ModalityCoverArea modality="donation"><></></ModalityCoverArea>);
    expect(area.toJSON()).not.toBeNull();
    const onClose = jest.fn();
    const onChoose = jest.fn();
    const sheet = await render(<PhotoSourceSheet visible onChoose={onChoose} onClose={onClose} />);
    expect(sheet.getByText("Adicionar foto")).toBeDefined();
    expect(sheet.queryByText("Como enquadrar")).toBeNull();
    await act(async () => { fireEvent.press(sheet.getByLabelText("Cancelar")); });
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(async () => { fireEvent.press(sheet.getByLabelText("Tirar foto com a câmera")); });
    expect(onChoose).toHaveBeenCalledWith("camera");
  });
});

describe("CreateListingStep1 — avisos do ISBN e fotos da etapa 2", () => {
  const step1 = {
    modality: "sale" as const, title: "", author: "", price: "", photoUrl: "", loading: false, error: null,
    onSetModality: jest.fn(), onSetTitle: jest.fn(), onSetAuthor: jest.fn(), onSetPrice: jest.fn(), onSetPhotoUrl: jest.fn(), onGoToPhotos: jest.fn(),
  };

  it("mostra aviso de erro, de informação e a busca em andamento", async () => {
    const error = await render(<CreateListingStep1 {...step1} isbnFeedback={{ type: "error", message: "ISBN não encontrado." }} />);
    expect(error.getByText("ISBN não encontrado.")).toBeDefined();
    const info = await render(<CreateListingStep1 {...step1} isbnFeedback={{ type: "info", message: "Buscando…" }} lookingUpIsbn />);
    expect(info.getByText("Buscando o livro...")).toBeDefined();
  });

  it("etapa 2 remove fotos e mostra a prévia", async () => {
    const onRemovePhoto = jest.fn();
    const onSetPhotoUrl = jest.fn();
    const screen = await render(
      <CreateListingStep2 photoUrl="https://cdn/capa.jpg" photos={["https://cdn/a.jpg", "https://cdn/b.jpg"]} loading={false} error="Falhou" onSetPhotoUrl={onSetPhotoUrl} onRemovePhoto={onRemovePhoto} />,
    );
    expect(screen.getByText("Falhou")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Remover foto da capa")); });
    expect(onSetPhotoUrl).toHaveBeenCalledWith("");
    await act(async () => { fireEvent.press(screen.getByLabelText("Remover lombada")); });
    expect(onRemovePhoto).toHaveBeenCalledWith(0);
    await act(async () => { fireEvent.press(screen.getByLabelText("Remover verso")); });
    expect(onRemovePhoto).toHaveBeenCalledWith(1);
  });
});
