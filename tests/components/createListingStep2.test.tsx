
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { PERMISSION_PROMPT_COPY } from "@/view/components/PermissionPromptDialog";
import { CreateListingStep2 } from "@/view/listings/createListingStep2";

const base = { photoUrl: "", photos: [] as string[], loading: false, error: null, onSetPhotoUrl: vi.fn(), onRemovePhoto: vi.fn() };

describe("CreateListingStep2 — câmera e galeria (Spec 092)", () => {
  it("escolher a galeria abre o motivo antes do prompt e a foto sai depois de permitir", async () => {
    const onChoosePhoto = vi.fn();
    const screen = await render(<CreateListingStep2 {...base} onChoosePhoto={onChoosePhoto} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Adicionar foto da capa")); });
    expect(screen.getByText("Tirar foto")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Escolher foto da galeria")); });
    // CA2 da Spec 020: primeiro a explicação, só depois o acesso do aparelho.
    expect(screen.getByText(PERMISSION_PROMPT_COPY.photos.title)).toBeDefined();
    expect(onChoosePhoto).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.photos.allow)); });
    expect(onChoosePhoto).toHaveBeenCalledWith("cover", "library");
  });

  it("a câmera do slot extra também passa pelo motivo antes de abrir", async () => {
    const onChoosePhoto = vi.fn();
    const screen = await render(<CreateListingStep2 {...base} onChoosePhoto={onChoosePhoto} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Adicionar lombada")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Tirar foto com a câmera")); });
    expect(onChoosePhoto).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.photos.allow)); });
    expect(onChoosePhoto).toHaveBeenCalledWith("extra", "camera");
  });

  it("CA4: 'publicar sem foto' não pede acesso nenhum e não chama o seletor", async () => {
    const onChoosePhoto = vi.fn();
    const screen = await render(<CreateListingStep2 {...base} onChoosePhoto={onChoosePhoto} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Adicionar páginas")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Tirar foto com a câmera")); });
    await act(async () => { fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.photos.later)); });
    expect(onChoosePhoto).not.toHaveBeenCalled();
    expect(screen.queryByText(PERMISSION_PROMPT_COPY.photos.title)).toBeNull();
  });

  it("mostra envio em andamento e erro, e deixa o link como alternativa", async () => {
    const screen = await render(<CreateListingStep2 {...base} uploading photoError="Permita o acesso à câmera." />);
    expect(screen.getByLabelText("Enviando foto")).toBeDefined();
    expect(screen.getByText("Permita o acesso à câmera.")).toBeDefined();
    // CA3/CA4: a recusa não trava a publicação — a capa ilustrativa cobre a falta de foto.
    expect(screen.getByText(/capa ilustrativa/)).toBeDefined();
    expect(screen.queryByLabelText("Endereço da foto da capa")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByText("Prefiro colar o link de uma imagem")); });
    expect(screen.getByLabelText("Endereço da foto da capa")).toBeDefined();
  });
});
