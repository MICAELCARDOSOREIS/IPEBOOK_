import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "@/model/errors";
import type { IAuthUseCases } from "@/usecase/iAuthUseCases";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(completePasswordReset: IAuthUseCases["completePasswordReset"]) {
  let result!: ReturnType<typeof useResetPasswordViewModel>;
  const auth = { completePasswordReset } as IAuthUseCases;
  function Probe() {
    result = useResetPasswordViewModel(auth);
    return null;
  }
  await act(async () => { mounted.push(create(createElement(Probe))); });
  return { get current() { return result; } };
}

afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((tree) => tree.unmount()); });
});

describe("ViewModel de nova senha", () => {
  it("confirma atualização bem sucedida", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const hook = await renderHook(update);
    await act(async () => { await hook.current[1].submit("ipebook://redefinir-senha?code=abc", "nova-senha"); });
    expect(update).toHaveBeenCalledWith("ipebook://redefinir-senha?code=abc", "nova-senha");
    expect(hook.current[0]).toEqual({ loading: false, error: null, success: true });
  });

  it("mostra erro de domínio sem marcar sucesso", async () => {
    const hook = await renderHook(async () => { throw new AuthError("Link expirado."); });
    await act(async () => { await hook.current[1].submit(null, "nova-senha"); });
    expect(hook.current[0]).toEqual({ loading: false, error: "Link expirado.", success: false });
  });

  it("esconde detalhe de erro inesperado", async () => {
    const hook = await renderHook(async () => { throw new Error("token interno"); });
    await act(async () => { await hook.current[1].submit(null, "nova-senha"); });
    expect(hook.current[0].error).toBe("Não foi possível atualizar a senha.");
  });
});
