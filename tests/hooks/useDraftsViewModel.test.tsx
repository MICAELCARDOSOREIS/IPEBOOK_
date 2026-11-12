import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(
  sessionUserId: string | null,
  useCases: Pick<IBookUseCases, "listDrafts" | "discardDraft">,
) {
  let result!: ReturnType<typeof useDraftsViewModel>;
  function HookProbe() {
    result = useDraftsViewModel(sessionUserId, useCases as IBookUseCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

const draft = (id: string, title: string): Book => ({
  id,
  title,
  author: "",
  ownerId: "u1",
  modality: "donation",
  status: "draft",
  draftStep: 2,
});

describe("testes de hook: useDraftsViewModel (Spec 017 — Confiabilidade)", () => {
  it("carrega rascunhos e sai do estado de carregamento", async () => {
    const hook = await renderHook("u1", {
      listDrafts: async () => [draft("d1", "Começo de anúncio")],
      discardDraft: async () => {},
    });

    expect(hook.current[0].drafts).toHaveLength(1);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBeNull();
  });

  it("mostra estado vazio sem erro quando não há rascunhos", async () => {
    const hook = await renderHook("u1", { listDrafts: async () => [], discardDraft: async () => {} });
    expect(hook.current[0].drafts).toHaveLength(0);
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro de domínio e permite recarregar", async () => {
    const listDrafts = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Sem conexão."))
      .mockResolvedValueOnce([draft("d1", "Rascunho")]);
    const hook = await renderHook("u1", { listDrafts, discardDraft: async () => {} });

    expect(hook.current[0].error).toBe("Sem conexão.");
    await act(async () => {
      await hook.current[1].reload();
    });
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].drafts).toHaveLength(1);
  });

  it("mascara erro inesperado com mensagem segura", async () => {
    const hook = await renderHook("u1", {
      listDrafts: async () => {
        throw new Error("falha crua do banco");
      },
      discardDraft: async () => {},
    });
    expect(hook.current[0].error).toBe("Não foi possível carregar seus rascunhos. Tente novamente.");
  });

  it("remove rascunho da lista ao descartar com sucesso", async () => {
    const discardDraft = vi.fn().mockResolvedValue(undefined);
    const hook = await renderHook("u1", {
      listDrafts: async () => [draft("d1", "Um"), draft("d2", "Dois")],
      discardDraft,
    });

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].discardDraft("d1");
    });

    expect(ok).toBe(true);
    expect(discardDraft).toHaveBeenCalledWith("d1", "u1");
    expect(hook.current[0].drafts.map((d) => d.id)).toEqual(["d2"]);
    expect(hook.current[0].discardingId).toBeNull();
  });

  it("mantém a lista e expõe discardError quando o descarte falha", async () => {
    const discardDraft = vi.fn().mockRejectedValue(new DomainError("Rascunho não encontrado."));
    const hook = await renderHook("u1", {
      listDrafts: async () => [draft("d1", "Um")],
      discardDraft,
    });

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].discardDraft("d1");
    });

    expect(ok).toBe(false);
    expect(hook.current[0].drafts).toHaveLength(1);
    expect(hook.current[0].discardError).toBe("Rascunho não encontrado.");
  });

  it("mascara erro inesperado ao descartar com mensagem segura", async () => {
    const discardDraft = vi.fn().mockRejectedValue(new Error("falha crua do banco"));
    const hook = await renderHook("u1", {
      listDrafts: async () => [draft("d1", "Um")],
      discardDraft,
    });

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].discardDraft("d1");
    });

    expect(ok).toBe(false);
    expect(hook.current[0].discardError).toBe("Não foi possível descartar o rascunho. Tente novamente.");
  });
});
