import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import type { IReportUseCases } from "@/usecase/iReportUseCases";
import { useReportUserViewModel } from "@/viewmodel/useReportUserViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  await act(async () => { mounted.splice(0).forEach((t) => t.unmount()); });
});

async function renderHook(submitUserReport: IReportUseCases["submitUserReport"]) {
  let result!: ReturnType<typeof useReportUserViewModel>;
  function Probe() {
    result = useReportUserViewModel({ submitReport: vi.fn(), submitUserReport });
    return null;
  }
  await act(async () => { mounted.push(create(createElement(Probe))); });
  return { get current() { return result; } };
}

describe("useReportUserViewModel (Spec 091)", () => {
  it("exige sessão e motivo antes de enviar", async () => {
    const submit = vi.fn();
    const hook = await renderHook(submit);
    await act(async () => { await hook.current[1].submit("ana", null); });
    expect(hook.current[0].error).toMatch(/entrar/);
    await act(async () => { await hook.current[1].submit("ana", "me"); });
    expect(hook.current[0].error).toMatch(/motivo/);
    expect(submit).not.toHaveBeenCalled();
  });

  it("envia com motivo e detalhes e marca sucesso", async () => {
    const submit = vi.fn().mockResolvedValue({});
    const hook = await renderHook(submit);
    await act(async () => { hook.current[1].setReason("fake_profile"); hook.current[1].setDetails("foto roubada"); });
    let ok = false;
    await act(async () => { ok = await hook.current[1].submit("ana", "me"); });
    expect(ok).toBe(true);
    expect(submit).toHaveBeenCalledWith({ reportedUserId: "ana", reason: "fake_profile", details: "foto roubada" }, "me");
    expect(hook.current[0].success).toBe(true);
  });

  it("mostra a mensagem de domínio quando falha", async () => {
    const hook = await renderHook(vi.fn().mockRejectedValue(new ValidationError("Você já denunciou esta pessoa.")));
    await act(async () => { hook.current[1].setReason("other"); });
    await act(async () => { await hook.current[1].submit("ana", "me"); });
    expect(hook.current[0].error).toBe("Você já denunciou esta pessoa.");
    expect(hook.current[0].success).toBe(false);
  });
});
