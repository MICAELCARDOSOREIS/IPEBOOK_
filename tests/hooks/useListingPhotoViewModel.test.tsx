import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IImagePickerService } from "@/model/services/iImagePickerService";
import type { IListingPhotoUseCases } from "@/usecase/iListingPhotoUseCases";
import { useListingPhotoViewModel } from "@/viewmodel/useListingPhotoViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((t) => t.unmount()); });
});

async function renderHook(picker: IImagePickerService, useCases: IListingPhotoUseCases) {
  let result!: ReturnType<typeof useListingPhotoViewModel>;
  function Probe() {
    result = useListingPhotoViewModel("u1", picker, useCases);
    return null;
  }
  await act(async () => { mounted.push(create(createElement(Probe))); });
  return { get current() { return result; } };
}

const image = { bytes: new Uint8Array([1]), fileName: "a.jpg" };

describe("useListingPhotoViewModel (Spec 092)", () => {
  it("escolhe com recorte de capa 5:8, envia e devolve a URL", async () => {
    const pickImage = vi.fn().mockResolvedValue(image);
    const upload = vi.fn().mockResolvedValue("https://cdn/u1/anuncio/a.jpg");
    const hook = await renderHook({ pickSquareImage: vi.fn(), pickImage }, { uploadListingPhoto: upload });
    let url: string | null = null;
    await act(async () => { url = await hook.current[1].choose("camera"); });
    expect(pickImage).toHaveBeenCalledWith("camera", [5, 8]);
    expect(upload).toHaveBeenCalledWith("u1", image);
    expect(url).toBe("https://cdn/u1/anuncio/a.jpg");
    expect(hook.current[0]).toEqual({ uploading: false, error: null });
  });

  it("cancelar não envia nem mostra erro", async () => {
    const upload = vi.fn();
    const hook = await renderHook({ pickSquareImage: vi.fn(), pickImage: vi.fn().mockResolvedValue(null) }, { uploadListingPhoto: upload });
    let url: string | null = "x";
    await act(async () => { url = await hook.current[1].choose("library"); });
    expect(url).toBeNull();
    expect(upload).not.toHaveBeenCalled();
    expect(hook.current[0].error).toBeNull();
  });

  it("mostra a mensagem de domínio ou uma genérica quando falha", async () => {
    const denied = await renderHook(
      { pickSquareImage: vi.fn(), pickImage: vi.fn().mockRejectedValue(new ValidationError("Permita o acesso à câmera.")) },
      { uploadListingPhoto: vi.fn() },
    );
    await act(async () => { await denied.current[1].choose("camera"); });
    expect(denied.current[0].error).toBe("Permita o acesso à câmera.");
    const network = await renderHook(
      { pickSquareImage: vi.fn(), pickImage: vi.fn().mockResolvedValue(image) },
      { uploadListingPhoto: vi.fn().mockRejectedValue(new Error("rede")) },
    );
    await act(async () => { await network.current[1].choose("library"); });
    expect(network.current[0].error).toBe("Não foi possível enviar a foto. Tente novamente.");
  });

  it("ignora um segundo toque enquanto o seletor está aberto", async () => {
    let release!: (value: typeof image | null) => void;
    const pickImage = vi.fn().mockReturnValue(new Promise((resolve) => { release = resolve; }));
    const hook = await renderHook({ pickSquareImage: vi.fn(), pickImage }, { uploadListingPhoto: vi.fn() });
    await act(async () => { void hook.current[1].choose("camera"); void hook.current[1].choose("camera"); });
    expect(pickImage).toHaveBeenCalledTimes(1);
    await act(async () => { release(null); });
  });
});
