import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/model/errors";
import type { Book } from "@/model/entities/book";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(
  sessionUserId: string | null,
  useCases: Pick<IBookUseCases, "listMyListings">,
) {
  let result!: ReturnType<typeof useMyListingsViewModel>;
  const loadingStates: boolean[] = [];
  function HookProbe() {
    result = useMyListingsViewModel(sessionUserId, useCases as IBookUseCases);
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

describe("testes de hook: useMyListingsViewModel (ISO/IEC 25010 - Confiabilidade)", () => {
  it("inicia em carregamento e atualiza para lista vazia com sucesso", async () => {
    const hook = await renderHook("u1", { listMyListings: async () => [] });
    expect(hook.loadingStates).toContain(true);
    expect(hook.current[0]).toMatchObject({ books: [], loading: false, error: null });
  });

  it("atualiza estado quando os anúncios do usuário são carregados com sucesso", async () => {
    const myBooks: Book[] = [
      {
        id: "1",
        title: "Grande Sertão: Veredas",
        author: "Guimarães Rosa",
        ownerId: "u1",
        modality: "sale",
        price: 50,
        status: "available",
      },
    ];
    const hook = await renderHook("u1", { listMyListings: async () => myBooks });
    expect(hook.current[0].books).toEqual(myBooks);
    expect(hook.current[0].loading).toBe(false);
  });

  it("trata erro de domínio e permite recuperação via reload", async () => {
    const listMyListings = vi
      .fn()
      .mockRejectedValueOnce(new DomainError("Falha temporária de rede."))
      .mockResolvedValueOnce([
        {
          id: "2",
          title: "Vidas Secas",
          author: "Graciliano Ramos",
          ownerId: "u1",
          modality: "trade",
          status: "available",
        },
      ]);

    const hook = await renderHook("u1", { listMyListings });
    expect(hook.current[0].error).toBe("Falha temporária de rede.");
    expect(hook.current[0].loading).toBe(false);

    await act(async () => {
      await hook.current[1].reload();
    });

    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].books).toHaveLength(1);
    expect(hook.current[0].books[0].title).toBe("Vidas Secas");
  });

  it("mascara erro inesperado com mensagem segura", async () => {
    const hook = await renderHook("u1", {
      listMyListings: async () => {
        throw new Error("DB crash connection refused");
      },
    });

    expect(hook.current[0].error).toBe("Não foi possível carregar seus anúncios. Tente novamente.");
    expect(hook.current[0].loading).toBe(false);
  });

  it("remove livro com sucesso da lista via cancelListing", async () => {
    const cancelListing = vi.fn().mockResolvedValue(undefined);
    const hook = await renderHook("u1", {
      listMyListings: async () => [
        {
          id: "1",
          title: "Dom Casmurro",
          author: "Machado",
          ownerId: "u1",
          modality: "trade",
          status: "available",
        },
      ],
      cancelListing,
    } as unknown as IBookUseCases);

    expect(hook.current[0].books).toHaveLength(1);

    let result = false;
    await act(async () => {
      result = await hook.current[1].cancelListing("1");
    });

    expect(result).toBe(true);
    expect(hook.current[0].books).toHaveLength(0);
    expect(hook.current[0].cancellingId).toBeNull();
    expect(hook.current[0].cancelError).toBeNull();
  });

  it("seta cancelError quando cancelListing falha com DomainError", async () => {
    const cancelListing = vi.fn().mockRejectedValue(new DomainError("Não é possível remover."));
    const hook = await renderHook("u1", {
      listMyListings: async () => [
        {
          id: "1",
          title: "Dom Casmurro",
          author: "Machado",
          ownerId: "u1",
          modality: "trade",
          status: "available",
        },
      ],
      cancelListing,
    } as unknown as IBookUseCases);

    let result = true;
    await act(async () => {
      result = await hook.current[1].cancelListing("1");
    });

    expect(result).toBe(false);
    expect(hook.current[0].books).toHaveLength(1);
    expect(hook.current[0].cancellingId).toBeNull();
    expect(hook.current[0].cancelError).toBe("Não é possível remover.");
  });
});
