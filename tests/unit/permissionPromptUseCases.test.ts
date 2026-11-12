import { describe, expect, it } from "vitest";
import { MemoryPermissionAskDataSource } from "@/infra/datasources/memoryPermissionAskDataSource";
import type { IPermissionService } from "@/model/services/iPermissionService";
import { PermissionPromptUseCases } from "@/usecase/permissionPromptUseCases";

function service(granted: boolean, requestResult = granted): IPermissionService & { requests: number } {
  const state = { requests: 0 };
  return {
    get requests() {
      return state.requests;
    },
    async isGranted() {
      return granted;
    },
    async request() {
      state.requests += 1;
      return requestResult;
    },
  };
}

describe("PermissionPromptUseCases (Spec 020)", () => {
  it("CA2: concedida no aparelho não explica de novo", async () => {
    const asked = new MemoryPermissionAskDataSource();
    const useCases = new PermissionPromptUseCases(service(true), asked);
    expect(await useCases.resolve()).toBe("granted");
    expect(await asked.hasAsked()).toBe(false);
  });

  it("CA2: sem pergunta anterior explica antes do prompt nativo", async () => {
    const useCases = new PermissionPromptUseCases(service(false), new MemoryPermissionAskDataSource());
    expect(await useCases.resolve()).toBe("explain");
  });

  it("CA3: já perguntada e negada não insiste", async () => {
    const asked = new MemoryPermissionAskDataSource();
    asked.setAsked(true);
    const useCases = new PermissionPromptUseCases(service(false), asked);
    expect(await useCases.resolve()).toBe("asked");
  });

  it("CA2: falha ao consultar o aparelho leva a explicar (nunca a pedir em silêncio)", async () => {
    const useCases = new PermissionPromptUseCases(
      {
        async isGranted() {
          throw new Error("sem suporte");
        },
        async request() {
          return false;
        },
      },
      new MemoryPermissionAskDataSource(),
    );
    expect(await useCases.resolve()).toBe("explain");
  });

  it("grava a pergunta quando abre o prompt do sistema e devolve a resposta", async () => {
    const asked = new MemoryPermissionAskDataSource();
    const push = service(false, false);
    const useCases = new PermissionPromptUseCases(push, asked);
    expect(await useCases.request()).toBe(false);
    expect(push.requests).toBe(1);
    expect(await asked.hasAsked()).toBe(true);
  });

  it("falha ao gravar o registro não impede o pedido nem derruba o app", async () => {
    const push = service(true, true);
    const useCases = new PermissionPromptUseCases(push, {
      async hasAsked() {
        return false;
      },
      async markAsked() {
        throw new Error("armazenamento cheio");
      },
    });
    await expect(useCases.request()).resolves.toBe(true);
  });
});
