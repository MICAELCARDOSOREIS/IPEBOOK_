import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import { DataSourceError, DomainError, ValidationError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useEditListingViewModel } from "@/viewmodel/useEditListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

function stubUseCases(overrides: Partial<IBookUseCases> = {}): IBookUseCases {
  return {
    listBooks: vi.fn().mockResolvedValue([]),
    getBookById: vi.fn().mockResolvedValue({
      id: "b1",
      title: "Livro Original",
      author: "Autor Original",
      category: "Literatura",
      modality: "sale",
      price: 35,
      ownerId: "user-1",
      status: "available",
      city: "Piripiri",
      state: "PI",
      neighborhood: "Centro",
      photoUrl: "https://example.com/capa.jpg",
      photos: ["https://example.com/foto1.jpg"],
    } satisfies Book),
    createListing: vi.fn(),
    updateListing: vi.fn().mockResolvedValue({
      id: "b1",
      title: "Livro Atualizado",
      author: "Autor Atualizado",
      modality: "sale",
      price: 40,
      ownerId: "user-1",
      status: "available",
    } satisfies Book),
    togglePauseListing: vi.fn(),
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
  let result!: ReturnType<typeof useEditListingViewModel>;
  const loadingStates: boolean[] = [];

  function HookProbe() {
    result = useEditListingViewModel(bookId, sessionUserId, useCases);
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

describe("useEditListingViewModel", () => {
  it("carrega dados do livro e preenche campos com sucesso", async () => {
    const hook = await renderHook("b1", "user-1");

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBeNull();
    expect(hook.current[0].title).toBe("Livro Original");
    expect(hook.current[0].author).toBe("Autor Original");
    expect(hook.current[0].category).toBe("Literatura");
    expect(hook.current[0].modality).toBe("sale");
    expect(hook.current[0].price).toBe("35");
    expect(hook.current[0].neighborhood).toBe("Centro");
    expect(hook.current[0].photoUrl).toBe("https://example.com/capa.jpg");
    expect(hook.current[0].photos).toEqual(["https://example.com/foto1.jpg"]);
  });

  it("emite erro se o usuário logado não for o dono do anúncio", async () => {
    const hook = await renderHook("b1", "invasor");

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBe("Você só pode editar seus próprios anúncios.");
  });

  it("emite erro se o anúncio estiver reservado", async () => {
    const useCases = stubUseCases({
      getBookById: vi.fn().mockResolvedValue({
        id: "b1",
        title: "Livro",
        author: "Autor",
        ownerId: "user-1",
        status: "reserved",
        modality: "donation",
      }),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBe(
      "Não é possível editar anúncio com negociação aceita em andamento.",
    );
  });

  it("emite erro se o anúncio não for encontrado", async () => {
    const useCases = stubUseCases({
      getBookById: vi.fn().mockRejectedValue(new DataSourceError("Anúncio não encontrado.")),
    });
    const hook = await renderHook("b99", "user-1", useCases);

    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].error).toBe("Anúncio não encontrado.");
  });

  it("permite atualizar campos e adicionar/remover fotos", async () => {
    const hook = await renderHook("b1", "user-1");

    await act(async () => {
      hook.current[1].setTitle("Novo Título");
      hook.current[1].setAuthor("Novo Autor");
      hook.current[1].setCategory("Ficção");
      hook.current[1].setModality("trade");
      hook.current[1].setNeighborhood("Floresta");
      hook.current[1].addPhoto("https://example.com/foto2.jpg");
    });

    expect(hook.current[0].title).toBe("Novo Título");
    expect(hook.current[0].author).toBe("Novo Autor");
    expect(hook.current[0].category).toBe("Ficção");
    expect(hook.current[0].modality).toBe("trade");
    expect(hook.current[0].price).toBe(""); // Limpa preço ao mudar de sale para trade
    expect(hook.current[0].neighborhood).toBe("Floresta");
    expect(hook.current[0].photos).toHaveLength(2);

    await act(async () => {
      hook.current[1].removePhoto(0);
    });
    expect(hook.current[0].photos).toEqual(["https://example.com/foto2.jpg"]);
  });

  it("limita o número de fotos em no máximo 5", async () => {
    const hook = await renderHook("b1", "user-1");

    await act(async () => {
      hook.current[1].addPhoto("foto 2");
      hook.current[1].addPhoto("foto 3");
      hook.current[1].addPhoto("foto 4");
      hook.current[1].addPhoto("foto 5");
      hook.current[1].addPhoto("foto 6");
    });

    expect(hook.current[0].photos).toHaveLength(5);
    expect(hook.current[0].error).toBe("O anúncio pode conter no máximo 5 fotos.");
  });

  it("submete alterações com sucesso chamando updateListing", async () => {
    const useCases = stubUseCases();
    const hook = await renderHook("b1", "user-1", useCases);

    await act(async () => {
      hook.current[1].setTitle("Título Atualizado");
      hook.current[1].setPrice("40");
    });

    let updatedBook: Book | null = null;
    await act(async () => {
      updatedBook = await hook.current[1].submit();
    });

    expect(updatedBook).not.toBeNull();
    expect(hook.current[0].success).toBe(true);
    expect(hook.current[0].saving).toBe(false);
    expect(useCases.updateListing).toHaveBeenCalledWith(
      "b1",
      expect.objectContaining({
        title: "Título Atualizado",
        price: 40,
      }),
      "user-1",
    );
  });

  it("captura erro ao submeter e atribui mensagem amigável", async () => {
    const useCases = stubUseCases({
      updateListing: vi.fn().mockRejectedValue(new ValidationError("Título é obrigatório.")),
    });
    const hook = await renderHook("b1", "user-1", useCases);

    await act(async () => {
      await hook.current[1].submit();
    });

    expect(hook.current[0].success).toBe(false);
    expect(hook.current[0].saving).toBe(false);
    expect(hook.current[0].error).toBe("Título é obrigatório.");
  });
});
