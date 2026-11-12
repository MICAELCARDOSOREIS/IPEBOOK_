import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { IFavoriteUseCases } from "@/usecase/iFavoriteUseCases";
import { useBookDetailViewModel } from "@/viewmodel/useBookDetailViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (mounted.length) mounted.pop()?.unmount();
  });
  vi.restoreAllMocks();
});

const sampleBook: Book = {
  id: "book-detail-1",
  title: "Vidas Secas",
  author: "Graciliano Ramos",
  ownerId: "owner-1",
  modality: "donation",
  status: "available",
};

async function renderHook(
  bookId: string,
  useCases: IBookUseCases,
  favorites: IFavoriteUseCases,
  userId: string | null = null,
) {
  let result!: ReturnType<typeof useBookDetailViewModel>;
  function Probe() {
    result = useBookDetailViewModel(bookId, useCases, favorites, userId);
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

describe("useBookDetailViewModel", () => {
  it("carrega livro com sucesso sem checar favoritos quando deslogado", async () => {
    const useCases = {
      getBookById: vi.fn().mockResolvedValue(sampleBook),
    } as unknown as IBookUseCases;
    const favorites = {
      isFavorite: vi.fn(),
      toggleFavorite: vi.fn(),
    } as unknown as IFavoriteUseCases;

    const hook = await renderHook("book-detail-1", useCases, favorites, null);
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].book?.title).toBe("Vidas Secas");
    expect(hook.current[0].isFavorite).toBe(false);
    expect(favorites.isFavorite).not.toHaveBeenCalled();
  });

  it("carrega favoritos quando há userId e trata erro na consulta de favoritos", async () => {
    const useCases = {
      getBookById: vi.fn().mockResolvedValue(sampleBook),
    } as unknown as IBookUseCases;
    const favorites = {
      isFavorite: vi.fn().mockResolvedValueOnce(true).mockRejectedValueOnce(new Error("Falha fav")),
      toggleFavorite: vi.fn(),
    } as unknown as IFavoriteUseCases;

    const hook = await renderHook("book-detail-1", useCases, favorites, "user-logged");
    expect(hook.current[0].isFavorite).toBe(true);
    expect(hook.current[0].favoriteError).toBeNull();

    // Recarrega e gera erro na consulta de favoritos
    await act(async () => {
      await hook.current[1].reload();
    });
    expect(hook.current[0].favoriteError).toBe("Não foi possível consultar favoritos.");
  });

  it("trata DomainError e erros genéricos ao carregar livro", async () => {
    const useCasesDomainErr = {
      getBookById: vi.fn().mockRejectedValue(new DomainError("Livro não encontrado.")),
    } as unknown as IBookUseCases;
    const favorites = { isFavorite: vi.fn(), toggleFavorite: vi.fn() } as unknown as IFavoriteUseCases;

    const hookDomain = await renderHook("book-detail-1", useCasesDomainErr, favorites);
    expect(hookDomain.current[0].error).toBe("Livro não encontrado.");

    const useCasesGenericErr = {
      getBookById: vi.fn().mockRejectedValue(new Error("Falha interna 500")),
    } as unknown as IBookUseCases;
    const hookGeneric = await renderHook("book-detail-1", useCasesGenericErr, favorites);
    expect(hookGeneric.current[0].error).toBe("Não foi possível carregar o anúncio. Tente novamente.");
  });

  it("alterna favorito com sucesso e trata erros", async () => {
    const useCases = { getBookById: vi.fn().mockResolvedValue(sampleBook) } as unknown as IBookUseCases;
    const favorites = {
      isFavorite: vi.fn().mockResolvedValue(false),
      toggleFavorite: vi.fn()
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new DomainError("Faça login para favoritar."))
        .mockRejectedValueOnce(new Error("Erro inesperado")),
    } as unknown as IFavoriteUseCases;

    const hook = await renderHook("book-detail-1", useCases, favorites, "user-logged");

    // Alterna com sucesso
    await act(async () => {
      await hook.current[1].toggleFavorite("user-logged");
    });
    expect(hook.current[0].isFavorite).toBe(true);
    expect(hook.current[0].favoriteError).toBeNull();

    // Erro de domínio
    await act(async () => {
      await hook.current[1].toggleFavorite("user-logged");
    });
    expect(hook.current[0].favoriteError).toBe("Faça login para favoritar.");

    // Erro genérico
    await act(async () => {
      await hook.current[1].toggleFavorite("user-logged");
    });
    expect(hook.current[0].favoriteError).toBe("Não foi possível atualizar favorito.");
  });
});
