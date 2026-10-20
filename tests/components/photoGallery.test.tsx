import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { PhotoGallery } from "@/view/listings/photoGallery";

const photos = ["foto-1.jpg", "foto-2.jpg", "foto-3.jpg"];

async function renderGallery(props: Partial<React.ComponentProps<typeof PhotoGallery>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(
      <PhotoGallery photos={photos} visible onClose={() => {}} {...props} />,
    );
  });
  return screen;
}

describe("PhotoGallery (spec 018 / issue #73)", () => {
  it("mostra o contador de fotos e desabilita 'Anterior' na primeira foto", async () => {
    const screen = await renderGallery();
    expect(screen.getByText("1 de 3")).toBeDefined();
    expect(screen.getByLabelText("Foto anterior").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText("Próxima foto").props.accessibilityState.disabled).toBe(false);
  });

  it("navega entre as fotos com Próxima e Anterior", async () => {
    const screen = await renderGallery();
    await act(async () => { fireEvent.press(screen.getByLabelText("Próxima foto")); });
    expect(screen.getByText("2 de 3")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Próxima foto")); });
    expect(screen.getByText("3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Próxima foto").props.accessibilityState.disabled).toBe(true);
    await act(async () => { fireEvent.press(screen.getByLabelText("Foto anterior")); });
    expect(screen.getByText("2 de 3")).toBeDefined();
  });

  it("aciona onClose ao tocar em Fechar", async () => {
    const onClose = vi.fn();
    const screen = await renderGallery({ onClose });
    fireEvent.press(screen.getByLabelText("Fechar galeria de fotos"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
