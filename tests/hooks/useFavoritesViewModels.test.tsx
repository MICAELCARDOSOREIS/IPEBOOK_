import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";
import { useFavoritesViewModel } from "@/viewmodel/useFavoritesViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook<T>(use: () => T) {
  let result!: T;
  function HookProbe() {
    result = use();
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

function montarLista(userId: string | null, parcial: Partial<IFavoriteUseCases> = {}) {
  const casos = casosDeUso(parcial);
  return renderHook(() => useFavoritesViewModel(userId, casos));
}

function montarBotao(userId: string | null, parcial: Partial<IFavoriteUseCases> = {}) {
  const casos = casosDeUso(parcial);
  return renderHook(() => useFavoriteButtonViewModel("l1", userId, casos));
}

const livro = (id: string) => ({ id, title: `Livro ${id}` }) as unknown as Book;

function casosDeUso(parcial: Partial<IFavoriteUseCases> = {}): IFavoriteUseCases {
  return {
    listFavorites: async () => [],
    isFavorite: async () => false,
    toggleFavorite: async () => true,
    ...parcial,
  };
}

describe("useFavoritesViewModel", () => {
  it("sem sessão não consulta favoritos e fica sem carregar", async () => {
    const listFavorites = vi.fn(async () => [livro("a")]);
    const hook = await montarLista(null, { listFavorites });

    expect(listFavorites).not.toHaveBeenCalled();
    expect(hook.current[0]).toMatchObject({ books: [], loading: false, error: null });
  });

  it("carrega os favoritos da pessoa logada", async () => {
    const hook = await montarLista("bia", { listFavorites: async () => [livro("a"), livro("b")] });

    expect(hook.current[0].books.map((b) => b.id)).toEqual(["a", "b"]);
    expect(hook.current[0].loading).toBe(false);
  });

  it("mostra a mensagem do DomainError ao falhar o carregamento", async () => {
    const hook = await montarLista("bia", {
          listFavorites: async () => {
            throw new DomainError("Favoritos indisponíveis.");
          },
        });

    expect(hook.current[0].error).toBe("Favoritos indisponíveis.");
    expect(hook.current[0].books).toEqual([]);
  });

  it("usa mensagem genérica para erros que não são de domínio", async () => {
    const hook = await montarLista("bia", {
          listFavorites: async () => {
            throw new Error("rede");
          },
        });

    expect(hook.current[0].error).toBe("Não foi possível carregar favoritos.");
  });

  it("removeFavorite tira o livro da lista e devolve true", async () => {
    const toggleFavorite = vi.fn(async () => false);
    const hook = await montarLista("bia", { listFavorites: async () => [livro("a"), livro("b")], toggleFavorite });

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].removeFavorite("a");
    });

    expect(ok).toBe(true);
    expect(toggleFavorite).toHaveBeenCalledWith("bia", "a");
    expect(hook.current[0].books.map((b) => b.id)).toEqual(["b"]);
    expect(hook.current[0].removingId).toBeNull();
  });

  it("removeFavorite mantém a lista e mostra o erro quando falha", async () => {
    const hook = await montarLista("bia", {
          listFavorites: async () => [livro("a")],
          toggleFavorite: async () => {
            throw new DomainError("Sem permissão.");
          },
        });

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].removeFavorite("a");
    });

    expect(ok).toBe(false);
    expect(hook.current[0].books.map((b) => b.id)).toEqual(["a"]);
    expect(hook.current[0].error).toBe("Sem permissão.");
    expect(hook.current[0].removingId).toBeNull();
  });

  it("removeFavorite com erro genérico usa a mensagem padrão", async () => {
    const hook = await montarLista("bia", {
          toggleFavorite: async () => {
            throw new Error("falha");
          },
        });

    await act(async () => {
      await hook.current[1].removeFavorite("a");
    });

    expect(hook.current[0].error).toBe("Não foi possível atualizar o favorito.");
  });

  it("removeFavorite sem sessão não faz nada", async () => {
    const toggleFavorite = vi.fn(async () => true);
    const hook = await montarLista(null, { toggleFavorite });

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].removeFavorite("a");
    });

    expect(ok).toBe(false);
    expect(toggleFavorite).not.toHaveBeenCalled();
  });
});

describe("useFavoriteButtonViewModel", () => {
  it("sem sessão fica desmarcado e não consulta", async () => {
    const isFavorite = vi.fn(async () => true);
    const hook = await montarBotao(null, { isFavorite });

    expect(isFavorite).not.toHaveBeenCalled();
    expect(hook.current[0]).toEqual({ selected: false, loading: false, error: null });
  });

  it("carrega o estado inicial de favorito", async () => {
    const hook = await montarBotao("bia", { isFavorite: async () => true });

    expect(hook.current[0].selected).toBe(true);
  });

  it("avisa quando a consulta inicial falha", async () => {
    const hook = await montarBotao("bia", {
          isFavorite: async () => {
            throw new Error("rede");
          },
        });

    expect(hook.current[0].error).toBe("Não foi possível consultar favoritos.");
  });

  it("toggle atualiza o estado com o valor devolvido", async () => {
    const hook = await montarBotao("bia", { toggleFavorite: async () => true });

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(hook.current[0]).toEqual({ selected: true, loading: false, error: null });
  });

  it("toggle mostra a mensagem do DomainError", async () => {
    const hook = await montarBotao(null, {
          toggleFavorite: async () => {
            throw new DomainError("Entre para favoritar.");
          },
        });

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(hook.current[0].error).toBe("Entre para favoritar.");
    expect(hook.current[0].loading).toBe(false);
  });

  it("toggle com erro genérico usa a mensagem padrão", async () => {
    const hook = await montarBotao("bia", {
          toggleFavorite: async () => {
            throw new Error("falha");
          },
        });

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(hook.current[0].error).toBe("Não foi possível atualizar favorito.");
  });
});
