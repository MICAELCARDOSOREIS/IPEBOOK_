import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { ValidationError } from "@/model/errors";
import type { IImagePickerService } from "@/model/services/iImagePickerService";
import type { IProfilePhotoUseCases } from "@/usecase/iProfilePhotoUseCases";
import { useProfilePhotoViewModel } from "@/viewmodel/useProfilePhotoViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

async function renderHook(picker: IImagePickerService, useCases: IProfilePhotoUseCases) {
  let result!: ReturnType<typeof useProfilePhotoViewModel>;
  function HookProbe() {
    result = useProfilePhotoViewModel("u1", picker, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return { get current() { return result; } };
}

const image = { bytes: new Uint8Array([1]), fileName: "a.jpg" };

describe("useProfilePhotoViewModel (Spec 081)", () => {
  it("escolhe, envia e devolve a URL (CA3)", async () => {
    const upload = jest.fn().mockResolvedValue("https://cdn/u1/perfil/a.jpg");
    const hook = await renderHook({ pickSquareImage: jest.fn().mockResolvedValue(image), pickImage: jest.fn() }, { uploadProfilePhoto: upload });
    let url: string | null = null;
    await act(async () => { url = await hook.current[1].choose("library"); });
    expect(url).toBe("https://cdn/u1/perfil/a.jpg");
    expect(upload).toHaveBeenCalledWith("u1", image);
    expect(hook.current[0]).toEqual({ uploading: false, error: null });
  });

  it("cancelar não envia nem mostra erro (CA4)", async () => {
    const upload = jest.fn();
    const hook = await renderHook({ pickSquareImage: jest.fn().mockResolvedValue(null), pickImage: jest.fn() }, { uploadProfilePhoto: upload });
    let url: string | null = "x";
    await act(async () => { url = await hook.current[1].choose("camera"); });
    expect(url).toBeNull();
    expect(upload).not.toHaveBeenCalled();
    expect(hook.current[0].error).toBeNull();
  });

  it("mostra a mensagem de domínio ou uma genérica quando falha (CA4)", async () => {
    const denied = await renderHook(
      { pickSquareImage: jest.fn().mockRejectedValue(new ValidationError("Permita o acesso à câmera.")), pickImage: jest.fn() },
      { uploadProfilePhoto: jest.fn() },
    );
    await act(async () => { await denied.current[1].choose("camera"); });
    expect(denied.current[0]).toEqual({ uploading: false, error: "Permita o acesso à câmera." });

    const network = await renderHook(
      { pickSquareImage: jest.fn().mockResolvedValue(image), pickImage: jest.fn() },
      { uploadProfilePhoto: jest.fn().mockRejectedValue(new Error("rede")) },
    );
    await act(async () => { await network.current[1].choose("library"); });
    expect(network.current[0].error).toBe("Não foi possível enviar a foto. Tente novamente.");
  });
});
