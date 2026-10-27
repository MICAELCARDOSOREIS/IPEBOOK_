import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { CreateListingStep2 } from "@/view/listings/createListingStep2";

const base = { photoUrl: "", photos: [] as string[], loading: false, error: null, onSetPhotoUrl: vi.fn(), onRemovePhoto: vi.fn() };

describe("CreateListingStep2 — câmera e galeria (Spec 092)", () => {
  it("toque na capa abre a folha e a escolha da galeria avisa o slot da capa", async () => {
    const onChoosePhoto = vi.fn();
    const screen = await render(<CreateListingStep2 {...base} onChoosePhoto={onChoosePhoto} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Adicionar foto da capa")); });
    expect(screen.getByText("Tirar foto")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Escolher foto da galeria")); });
    expect(onChoosePhoto).toHaveBeenCalledWith("cover", "library");
  });

  it("toque nas outras fotos usa o slot extra e a câmera", async () => {
    const onChoosePhoto = vi.fn();
    const screen = await render(<CreateListingStep2 {...base} onChoosePhoto={onChoosePhoto} />);
    await act(async () => { fireEvent.press(screen.getByLabelText("Adicionar lombada")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Tirar foto com a câmera")); });
    expect(onChoosePhoto).toHaveBeenCalledWith("extra", "camera");
  });

  it("mostra envio em andamento e erro, e deixa o link como alternativa", async () => {
    const screen = await render(<CreateListingStep2 {...base} uploading photoError="Permita o acesso à câmera." />);
    expect(screen.getByLabelText("Enviando foto")).toBeDefined();
    expect(screen.getByText("Permita o acesso à câmera.")).toBeDefined();
    expect(screen.queryByLabelText("Endereço da foto da capa")).toBeNull();
    await act(async () => { fireEvent.press(screen.getByText("Prefiro colar o link de uma imagem")); });
    expect(screen.getByLabelText("Endereço da foto da capa")).toBeDefined();
  });
});
