import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(useCases: IBookUseCases) {
  let result!: ReturnType<typeof useHomeViewModel>;
  const loadingStates: boolean[] = [];
  function HookProbe() {
    result = useHomeViewModel(useCases);
    loadingStates.push(result[0].loading);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
    loadingStates,
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("testes de hook: useHomeViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  it("inicia em carregamento e atualiza para catálogo vazio com sucesso", async () => {
    const hook = await renderHook({ listBooks: async () => [] });
    expect(hook.loadingStates).toContain(true);
    expect(hook.current[0]).toEqual({ books: [], loading: false, error: null });
  });

  it("atualiza estado quando livros são carregados com sucesso", async () => {
    const books = [
      { id: "1", title: "O Quinze", author: "Rachel de Queiroz", status: "available" as const },
      { id: "2", title: "Capitães da Areia", author: "Jorge Amado", status: "available" as const },
    ];
    const hook = await renderHook({ listBooks: async () => books });
    expect(hook.current[0].books).toEqual(books);
    expect(hook.current[0].loading).toBe(false);
  });

  it("trata erro de domínio amigável e permite recuperação via reload", async () => {
    const listBooks = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Serviço de catálogo em manutenção."))
      .mockResolvedValueOnce([
        { id: "3", title: "Iracema", author: "José de Alencar", status: "available" as const },
      ]);

    const hook = await renderHook({ listBooks });
    expect(hook.current[0].error).toBe("Serviço de catálogo em manutenção.");
    expect(hook.current[0].loading).toBe(false);

    await act(async () => {
      await hook.current[1].reload();
    });

    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].books).toHaveLength(1);
    expect(listBooks).toHaveBeenCalledTimes(2);
  });

  it("sanitiza exceções técnicas inesperadas protegendo detalhes internos", async () => {
    const hook = await renderHook({
      listBooks: async () => {
        throw new Error("Database connection pool exhausted: 5432");
      },
    });

    expect(hook.current[0].error).toBe("Não foi possível carregar os livros. Tente novamente.");
    expect(hook.current[0].loading).toBe(false);
  });

  it("protege contra condições de corrida (descarta resposta antiga quando recarregado)", async () => {
    let resolveFirst!: (books: readonly Book[]) => void;
    const pending = new Promise<readonly Book[]>((resolve) => {
      resolveFirst = resolve;
    });
    const livrosRecentes: readonly Book[] = [
      { id: "rec-1", title: "Resultado Recente", author: "Autor Moderno", status: "available" },
    ];
    const listBooks = vi.fn().mockReturnValueOnce(pending).mockResolvedValueOnce(livrosRecentes);

    const hook = await renderHook({ listBooks });
    expect(hook.current[0].loading).toBe(true);

    await act(async () => {
      await hook.current[1].reload();
    });

    await act(async () => {
      resolveFirst([]);
    });

    expect(hook.current[0].books).toEqual(livrosRecentes);
  });
});
