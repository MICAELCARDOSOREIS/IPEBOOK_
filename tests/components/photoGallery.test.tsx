import React from "react";
import { act, fireEvent, render, cleanup } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";
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

function swipeTo(screen: Awaited<ReturnType<typeof render>>, index: number, width = 400) {
  const list = screen.getByTestId("photo-gallery-list");
  fireEvent(list, "momentumScrollEnd", {
    nativeEvent: {
      contentOffset: { x: index * width, y: 0 },
      layoutMeasurement: { width, height: 600 },
    },
  });
}

describe("PhotoGallery (spec 018 / spec 038, issues #73 e #143)", () => {
  afterEach(() => {
    cleanup();
  });

  it("mostra o contador de fotos e desabilita 'Anterior' na primeira foto", async () => {
    const screen = await renderGallery();
    expect(screen.getByText("Foto 1 de 3")).toBeDefined();
    expect(screen.getByLabelText("Foto anterior").props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText("Próxima foto").props.accessibilityState.disabled).toBe(false);
  });

  it("cada foto renderizada tem rótulo de acessibilidade próprio", async () => {
    const screen = await renderGallery();
    expect(screen.getByLabelText("Foto 1 do anúncio")).toBeDefined();
    expect(screen.getByLabelText("Foto 2 do anúncio")).toBeDefined();
    expect(screen.getByLabelText("Foto 3 do anúncio")).toBeDefined();
  });

  it("navega entre as fotos com Próxima e Anterior", async () => {
    const screen = await renderGallery();
    await act(async () => { fireEvent.press(screen.getByLabelText("Próxima foto")); });
    expect(screen.getByText("Foto 2 de 3")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Próxima foto")); });
    expect(screen.getByText("Foto 3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Próxima foto").props.accessibilityState.disabled).toBe(true);
    await act(async () => { fireEvent.press(screen.getByLabelText("Foto anterior")); });
    expect(screen.getByText("Foto 2 de 3")).toBeDefined();
  });

  it("navega por swipe horizontal (onMomentumScrollEnd)", async () => {
    const screen = await renderGallery();
    await act(async () => { swipeTo(screen, 2); });
    expect(screen.getByText("Foto 3 de 3")).toBeDefined();
    expect(screen.getByLabelText("Próxima foto").props.accessibilityState.disabled).toBe(true);
  });

  it("aciona onClose ao tocar em Fechar", async () => {
    const onClose = vi.fn();
    const screen = await renderGallery({ onClose });
    fireEvent.press(screen.getByLabelText("Fechar galeria de fotos"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("navegação por teclado na Web (issue #143)", () => {
    const originalOS = Platform.OS;
    const originalDocument = (globalThis as { document?: unknown }).document;

    type FakeListener = (event: { key: string; preventDefault: () => void }) => void;

    const installFakeDocument = () => {
      const listeners = new Set<FakeListener>();
      const fakeDocument = {
        addEventListener: (type: string, listener: FakeListener) => {
          if (type === "keydown") listeners.add(listener);
        },
        removeEventListener: (type: string, listener: FakeListener) => {
          if (type === "keydown") listeners.delete(listener);
        },
        dispatch: (event: { key: string }) => {
          listeners.forEach((listener) => listener({ preventDefault: () => {}, ...event }));
        },
      };
      (globalThis as { document?: unknown }).document = fakeDocument;
      return fakeDocument;
    };

    afterEach(() => {
      cleanup();
      Platform.OS = originalOS;
      (globalThis as { document?: unknown }).document = originalDocument;
    });

    it("Esc fecha a galeria", async () => {
      Platform.OS = "web";
      const fakeDocument = installFakeDocument();
      const onClose = vi.fn();
      await renderGallery({ onClose });

      fakeDocument.dispatch({ key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Seta direita avança e Seta esquerda volta a foto", async () => {
      Platform.OS = "web";
      const fakeDocument = installFakeDocument();
      const screen = await renderGallery();

      await act(async () => { fakeDocument.dispatch({ key: "ArrowRight" }); });
      expect(screen.getByText("Foto 2 de 3")).toBeDefined();

      await act(async () => { fakeDocument.dispatch({ key: "ArrowLeft" }); });
      expect(screen.getByText("Foto 1 de 3")).toBeDefined();
    });

    it("não reage a teclado fora da Web", async () => {
      Platform.OS = "ios";
      const fakeDocument = installFakeDocument();
      const onClose = vi.fn();
      await renderGallery({ onClose });

      fakeDocument.dispatch({ key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
