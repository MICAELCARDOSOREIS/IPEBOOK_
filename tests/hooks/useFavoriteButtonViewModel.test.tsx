import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import { useFavoriteButtonViewModel } from "@/viewmodel/useFavoriteButtonViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
afterEach(async () => {
  while (mounted.length > 0) {
    const t = mounted.pop();
    await act(async () => { t?.unmount(); });
  }
});

function stubFavoriteUseCases(overrides: Partial<IFavoriteUseCases> = {}): IFavoriteUseCases {
  return {
    isFavorite: vi.fn().mockResolvedValue(false),
    toggleFavorite: vi.fn().mockResolvedValue(true),
    listFavorites: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

async function renderHook(bookId: string, userId: string | null, useCases: IFavoriteUseCases) {
  let result!: ReturnType<typeof useFavoriteButtonViewModel>;
  function Probe() {
    result = useFavoriteButtonViewModel(bookId, userId, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

describe("useFavoriteButtonViewModel", () => {
  it("inicia sem favorito quando userId for nulo", async () => {
    const useCases = stubFavoriteUseCases();
    const hook = await renderHook("book-1", null, useCases);

    expect(hook.current[0].selected).toBe(false);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBeNull();
    expect(useCases.isFavorite).not.toHaveBeenCalled();
  });

  it("carrega estado de favorito com sucesso quando userId presente", async () => {
    const useCases = stubFavoriteUseCases({
      isFavorite: vi.fn().mockResolvedValue(true),
    });
    const hook = await renderHook("book-1", "user-1", useCases);

    expect(useCases.isFavorite).toHaveBeenCalledWith("user-1", "book-1");
    expect(hook.current[0].selected).toBe(true);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro ao consultar favoritos", async () => {
    const useCases = stubFavoriteUseCases({
      isFavorite: vi.fn().mockRejectedValue(new Error("Erro de conexão")),
    });
    const hook = await renderHook("book-1", "user-1", useCases);

    expect(hook.current[0].error).toBe("Não foi possível consultar favoritos.");
  });

  it("alterna favorito com sucesso via toggle", async () => {
    const useCases = stubFavoriteUseCases({
      isFavorite: vi.fn().mockResolvedValue(false),
      toggleFavorite: vi.fn().mockResolvedValue(true),
    });
    const hook = await renderHook("book-1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(useCases.toggleFavorite).toHaveBeenCalledWith("user-1", "book-1");
    expect(hook.current[0].selected).toBe(true);
    expect(hook.current[0].error).toBeNull();
  });

  it("trata erro DomainError ao alternar favorito", async () => {
    const useCases = stubFavoriteUseCases({
      toggleFavorite: vi.fn().mockRejectedValue(new DomainError("Ação não permitida")),
    });
    const hook = await renderHook("book-1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(hook.current[0].error).toBe("Ação não permitida");
  });

  it("trata erro inesperado genérico ao alternar favorito", async () => {
    const useCases = stubFavoriteUseCases({
      toggleFavorite: vi.fn().mockRejectedValue(new Error("Falha 500")),
    });
    const hook = await renderHook("book-1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].toggle();
    });

    expect(hook.current[0].error).toBe("Não foi possível atualizar favorito.");
  });
});
