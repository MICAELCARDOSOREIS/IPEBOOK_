import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IPermissionPromptUseCases, PermissionDecision } from "@/usecase/iPermissionPromptUseCases";
import { usePermissionPromptViewModel, type PermissionPromptState } from "@/viewmodel/usePermissionPromptViewModel";

const mounted: ReactTestRenderer[] = [];
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
});

function fakeUseCases(decision: PermissionDecision, requestResult = true): IPermissionPromptUseCases & {
  markAsked: ReturnType<typeof vi.fn>;
} {
  return {
    resolve: vi.fn().mockResolvedValue(decision),
    request: vi.fn().mockResolvedValue(requestResult),
    markAsked: vi.fn().mockResolvedValue(undefined),
  };
}

async function mount(prompts: IPermissionPromptUseCases) {
  let state!: PermissionPromptState;
  let actions!: ReturnType<typeof usePermissionPromptViewModel>[1];
  function Probe() {
    const result = usePermissionPromptViewModel(prompts);
    state = result[0];
    actions = result[1];
    return null;
  }
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(Probe));
    mounted.push(renderer);
  });
  return { getState: () => state, actions: () => actions, renderer };
}

describe("usePermissionPromptViewModel (Spec 020 T004)", () => {
  it("CA2: refresh abre a explicação quando ainda não foi perguntada", async () => {
    const prompts = fakeUseCases("explain");
    const view = await mount(prompts);
    expect(view.getState().status).toBe("idle");
    await act(async () => void (await view.actions().refresh()));
    expect(view.getState()).toEqual({ status: "explain", granted: false });
  });

  it("CA2: refresh com a permissão já concedida não abre aviso", async () => {
    const prompts = fakeUseCases("granted");
    const view = await mount(prompts);
    await act(async () => void (await view.actions().refresh()));
    expect(view.getState()).toEqual({ status: "idle", granted: true });
  });

  it("CA3: recusa anterior não reabre a explicação", async () => {
    const prompts = fakeUseCases("asked");
    const view = await mount(prompts);
    await act(async () => void (await view.actions().refresh()));
    expect(view.getState()).toEqual({ status: "idle", granted: false });
  });

  it("approve abre o prompt do sistema e segue com a concessão", async () => {
    const prompts = fakeUseCases("explain", true);
    const view = await mount(prompts);
    let granted!: boolean;
    await act(async () => {
      granted = await view.actions().approve();
    });
    expect(granted).toBe(true);
    expect(prompts.request).toHaveBeenCalledTimes(1);
    expect(view.getState()).toEqual({ status: "idle", granted: true });
  });

  it("CA3: negada no sistema mostra o estado de recurso indisponível", async () => {
    const prompts = fakeUseCases("explain", false);
    const view = await mount(prompts);
    await act(async () => void (await view.actions().approve()));
    expect(view.getState()).toEqual({ status: "denied", granted: false });

    await act(async () => view.actions().dismiss());
    expect(view.getState().status).toBe("idle");
  });

  it("CA3: 'agora não' registra a pergunta sem abrir o prompt nativo", async () => {
    const prompts = fakeUseCases("explain");
    const view = await mount(prompts);
    await act(async () => void (await view.actions().decline()));
    expect(prompts.request).not.toHaveBeenCalled();
    expect(prompts.markAsked).toHaveBeenCalledTimes(1);
    expect(view.getState().status).toBe("idle");
  });

  it("Spec 127: reopen reabre a explicação a pedido, mesmo depois de a pergunta já ter sido registrada", async () => {
    const prompts = fakeUseCases("asked");
    const view = await mount(prompts);
    await act(async () => void (await view.actions().refresh()));
    expect(view.getState().status).toBe("idle");

    await act(async () => view.actions().reopen());
    expect(view.getState()).toEqual({ status: "explain", granted: false });
    expect(prompts.resolve).toHaveBeenCalledTimes(1);
    expect(prompts.request).not.toHaveBeenCalled();

    await act(async () => void (await view.actions().approve()));
    expect(prompts.request).toHaveBeenCalledTimes(1);
  });
});
