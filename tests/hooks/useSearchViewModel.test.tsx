import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: Pick<IBookUseCases, "listBooks">) {
  let result!: ReturnType<typeof useSearchViewModel>;
  function HookProbe() {
    result = useSearchViewModel(useCases as IBookUseCases);
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

const books = [
  { id: "1", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u1", modality: "donation" as const, status: "available" as const },
  { id: "2", title: "Capitães da Areia", author: "Jorge Amado", ownerId: "u2", modality: "trade" as const, status: "available" as const },
];

describe("testes de hook: useSearchViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("sem termo, mostra o catálogo completo já carregado", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    expect(hook.current[0].books).toEqual(books);
  });

  it("filtra por título sem diferenciar maiúsculas/minúsculas", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("dom cas");
    });
    expect(hook.current[0].books).toEqual([books[0]]);
  });

  it("filtra por autor sem diferenciar maiúsculas/minúsculas", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("JORGE");
    });
    expect(hook.current[0].books).toEqual([books[1]]);
  });

  it("filtra por categoria quando o anúncio a informa", async () => {
    const categorized = { ...books[0], category: "Romance" };
    const hook = await renderHook({ listBooks: async () => [categorized, books[1]] });
    await act(async () => { hook.current[1].setTerm("romance"); });
    expect(hook.current[0].books).toEqual([categorized]);
  });

  it("retorna lista vazia quando nenhum livro corresponde ao termo", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("inexistente");
    });
    expect(hook.current[0].books).toEqual([]);
  });

  it("limpar o termo volta a mostrar o catálogo completo", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("dom cas");
    });
    await act(async () => {
      hook.current[1].setTerm("");
    });
    expect(hook.current[0].books).toEqual(books);
  });

  it("não chama listBooks de novo ao mudar o termo (filtro client-side, FR-005)", async () => {
    let calls = 0;
    const hook = await renderHook({
      listBooks: async () => {
        calls += 1;
        return books;
      },
    });
    await act(async () => {
      hook.current[1].setTerm("dom");
    });
    await act(async () => {
      hook.current[1].setTerm("dom casmurro");
    });
    expect(calls).toBe(1);
  });
});
