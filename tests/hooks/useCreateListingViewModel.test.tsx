import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthError, ValidationError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function stubUseCases(overrides: Partial<IBookUseCases> = {}): IBookUseCases {
  return {
    listBooks: async () => [],
    createListing: vi.fn(async (input) => ({
      id: "new-1",
      title: input.title,
      author: input.author,
      ownerId: "user-1",
      modality: input.modality,
      price: input.price,
      status: "available" as const,
    })),
    getBookById: async () => {
      throw new Error("not implemented");
    },
    listMyListings: async () => [],
    cancelListing: vi.fn(async () => {}),
    ...overrides,
  };
}

async function renderHook(useCases: IBookUseCases) {
  let result!: ReturnType<typeof useCreateListingViewModel>;
  function HookProbe() {
    result = useCreateListingViewModel(useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() { return result; },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("useCreateListingViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("inicia com estado padrão do formulário", async () => {
    const hook = await renderHook(stubUseCases());
    const [state] = hook.current;
    expect(state.title).toBe("");
    expect(state.author).toBe("");
    expect(state.modality).toBe("sale");
    expect(state.price).toBe("");
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.success).toBe(false);
  });

  it("atualiza campos do formulário via actions", async () => {
    const hook = await renderHook(stubUseCases());

    await act(async () => {
      hook.current[1].setTitle("Dom Casmurro");
    });
    expect(hook.current[0].title).toBe("Dom Casmurro");

    await act(async () => {
      hook.current[1].setAuthor("Machado de Assis");
    });
    expect(hook.current[0].author).toBe("Machado de Assis");

    await act(async () => {
      hook.current[1].setModality("donation");
    });
    expect(hook.current[0].modality).toBe("donation");

    await act(async () => {
      hook.current[1].setPrice("29,90");
    });
    expect(hook.current[0].price).toBe("29,90");
  });

  it("limpa o preço ao mudar modalidade para troca ou doação", async () => {
    const hook = await renderHook(stubUseCases());

    await act(async () => {
      hook.current[1].setPrice("15.00");
    });
    expect(hook.current[0].price).toBe("15.00");

    await act(async () => {
      hook.current[1].setModality("trade");
    });
    expect(hook.current[0].price).toBe("");
  });

  it("cadastra anúncio com sucesso e reseta formulário", async () => {
    const mock = stubUseCases();
    const hook = await renderHook(mock);

    await act(async () => {
      hook.current[1].setTitle("Livro Teste");
      hook.current[1].setAuthor("Autor Teste");
      hook.current[1].setModality("donation");
    });

    let result: unknown;
    await act(async () => {
      result = await hook.current[1].submit("user-1");
    });

    expect(result).toBeTruthy();
    expect(hook.current[0].success).toBe(true);
    expect(hook.current[0].title).toBe("");
    expect(hook.current[0].author).toBe("");
    expect(mock.createListing).toHaveBeenCalledWith(
      { title: "Livro Teste", author: "Autor Teste", modality: "donation", price: undefined },
      "user-1",
    );
  });

  it("inclui categoria preenchida ao publicar", async () => {
    const mock = stubUseCases();
    const hook = await renderHook(mock);
    await act(async () => {
      hook.current[1].setTitle("Livro Teste");
      hook.current[1].setAuthor("Autor Teste");
      hook.current[1].setCategory(" Romance ");
    });
    await act(async () => { await hook.current[1].submit("user-1"); });
    expect(mock.createListing).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Romance" }), "user-1",
    );
  });

  it("exibe erro de sessão quando sessionUserId é nulo", async () => {
    const mock = stubUseCases({
      createListing: vi.fn(async () => { throw new AuthError("Sessão obrigatória para cadastrar anúncio."); }),
    });
    const hook = await renderHook(mock);

    await act(async () => {
      hook.current[1].setTitle("Livro");
      hook.current[1].setAuthor("Autor");
    });

    await act(async () => {
      await hook.current[1].submit(null);
    });

    expect(hook.current[0].error).toBe("Sessão obrigatória para cadastrar anúncio.");
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].success).toBe(false);
  });

  it("exibe erro de validação quando payload é inválido", async () => {
    const mock = stubUseCases({
      createListing: vi.fn(async () => { throw new ValidationError("Título do livro é obrigatório."); }),
    });
    const hook = await renderHook(mock);

    await act(async () => {
      await hook.current[1].submit("user-1");
    });

    expect(hook.current[0].error).toBe("Título do livro é obrigatório.");
    expect(hook.current[0].loading).toBe(false);
  });

  it("sanitiza exceções técnicas inesperadas", async () => {
    const mock = stubUseCases({
      createListing: vi.fn(async () => { throw new Error("Internal server error"); }),
    });
    const hook = await renderHook(mock);

    await act(async () => {
      await hook.current[1].submit("user-1");
    });

    expect(hook.current[0].error).toBe("Não foi possível cadastrar o anúncio. Tente novamente.");
  });

  it("reseta o formulário para o estado inicial", async () => {
    const hook = await renderHook(stubUseCases());

    await act(async () => {
      hook.current[1].setTitle("Algo");
      hook.current[1].setAuthor("Alguém");
    });
    expect(hook.current[0].title).toBe("Algo");

    await act(async () => {
      hook.current[1].reset();
    });

    expect(hook.current[0].title).toBe("");
    expect(hook.current[0].author).toBe("");
    expect(hook.current[0].modality).toBe("sale");
  });
});
