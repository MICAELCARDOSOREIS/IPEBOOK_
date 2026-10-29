import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { AuthError, DataSourceError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useManageListingViewModel } from "@/viewmodel/useManageListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

const book: Book = {
  id: "b1",
  title: "Dom Casmurro",
  author: "Machado de Assis",
  ownerId: "user-1",
  modality: "donation",
  status: "available",
};

function stubUseCases(overrides: Partial<IBookUseCases> = {}): IBookUseCases {
  return {
    listBooks: vi.fn().mockResolvedValue([]),
    getBookById: vi.fn().mockResolvedValue(book),
    createListing: vi.fn(),
    updateListing: vi.fn(),
    togglePauseListing: vi.fn().mockResolvedValue({ ...book, status: "paused" }),
    listMyListings: vi.fn().mockResolvedValue([]),
    cancelListing: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

async function renderHook(
  bookId: string,
  sessionUserId: string | null,
  useCases: IBookUseCases = stubUseCases(),
) {
  let result!: ReturnType<typeof useManageListingViewModel>;

  function HookProbe() {
    result = useManageListingViewModel(bookId, sessionUserId, useCases);
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

describe("useManageListingViewModel", () => {
  it("carrega o anúncio do próprio usuário", async () => {
    const hook = await renderHook("b1", "user-1");

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].book?.title).toBe("Dom Casmurro");
    expect(hook.current[0].error).toBeNull();
  });

  it("recusa anúncio de outra pessoa sem expor os dados", async () => {
    const hook = await renderHook("b1", "outro-usuario");

    expect(hook.current[0].book).toBeNull();
    expect(hook.current[0].error).toBe("Você só pode gerenciar seus próprios anúncios.");
  });

  it("informa erro de domínio ao carregar", async () => {
    const useCases = stubUseCases({
      getBookById: vi.fn().mockRejectedValue(new DataSourceError("Anúncio não encontrado.")),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    expect(hook.current[0].book).toBeNull();
    expect(hook.current[0].error).toBe("Anúncio não encontrado.");
  });

  it("carrega sem bloquear quando não há sessão conhecida", async () => {
    const hook = await renderHook("b1", null);

    expect(hook.current[0].book?.id).toBe("b1");
    expect(hook.current[0].error).toBeNull();
  });

  it("usa mensagem genérica quando a carga falha por erro inesperado", async () => {
    const useCases = stubUseCases({
      getBookById: vi.fn().mockRejectedValue(new Error("falha de rede")),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    expect(hook.current[0].error).toBe("Não foi possível carregar o anúncio.");
  });

  it("recarrega o anúncio sob demanda", async () => {
    const useCases = stubUseCases();
    const hook = await renderHook("b1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].load();
    });

    expect(useCases.getBookById).toHaveBeenCalledTimes(2);
  });

  it("pausa o anúncio e atualiza o estado exibido", async () => {
    const useCases = stubUseCases();
    const hook = await renderHook("b1", "user-1", useCases);

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].togglePause();
    });

    expect(ok).toBe(true);
    expect(useCases.togglePauseListing).toHaveBeenCalledWith("b1", "user-1");
    expect(hook.current[0].book?.status).toBe("paused");
  });

  it("mantém o anúncio e informa a falha quando a pausa é recusada", async () => {
    const useCases = stubUseCases({
      togglePauseListing: vi.fn().mockRejectedValue(new AuthError("Sessão obrigatória para pausar ou retomar anúncio.")),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    let ok = true;
    await act(async () => {
      ok = await hook.current[1].togglePause();
    });

    expect(ok).toBe(false);
    expect(hook.current[0].book?.status).toBe("available");
    expect(hook.current[0].error).toBe("Sessão obrigatória para pausar ou retomar anúncio.");
  });

  it("marca o anúncio como removido depois de excluir", async () => {
    const useCases = stubUseCases();
    const hook = await renderHook("b1", "user-1", useCases);

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].remove();
    });

    expect(ok).toBe(true);
    expect(useCases.cancelListing).toHaveBeenCalledWith("b1", "user-1");
    expect(hook.current[0].removed).toBe(true);
  });

  it("usa mensagem genérica quando a exclusão falha por erro inesperado", async () => {
    const useCases = stubUseCases({
      cancelListing: vi.fn().mockRejectedValue(new Error("falha de rede")),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].remove();
    });

    expect(hook.current[0].removed).toBe(false);
    expect(hook.current[0].error).toBe("Não foi possível concluir a ação. Tente novamente.");
  });
});
