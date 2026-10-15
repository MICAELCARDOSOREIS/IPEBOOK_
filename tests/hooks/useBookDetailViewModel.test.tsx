import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(bookId: string, useCases: Pick<IBookUseCases, "getBookById">) {
  let result!: ReturnType<typeof useBookDetailViewModel>;
  function HookProbe() {
    result = useBookDetailViewModel(bookId, useCases as IBookUseCases);
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

const book = { id: "a", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u1", modality: "donation" as const, status: "available" as const };

describe("testes de hook: useBookDetailViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  it("carrega o livro pelo id", async () => {
    const hook = await renderHook("a", { getBookById: async () => book });
    expect(hook.current[0]).toEqual({ book, loading: false, error: null });
  });

  it("trata id inexistente com mensagem de erro de domínio (FR-009)", async () => {
    const hook = await renderHook("inexistente", {
      getBookById: async () => {
        throw new DomainError("Anúncio não encontrado.");
      },
    });
    expect(hook.current[0]).toEqual({ book: null, loading: false, error: "Anúncio não encontrado." });
  });

  it("sanitiza exceções técnicas inesperadas", async () => {
    const hook = await renderHook("a", {
      getBookById: async () => {
        throw new Error("falha interna qualquer");
      },
    });
    expect(hook.current[0].error).toBe("Não foi possível carregar o anúncio. Tente novamente.");
  });

  it("permite recarregar via reload", async () => {
    const getBookById = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Anúncio não encontrado."))
      .mockResolvedValueOnce(book);
    const hook = await renderHook("a", { getBookById });
    expect(hook.current[0].error).toBe("Anúncio não encontrado.");
    await act(async () => {
      await hook.current[1].reload();
    });
    expect(hook.current[0].book).toEqual(book);
  });
});
