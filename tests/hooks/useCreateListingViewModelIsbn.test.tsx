import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

const fakeUseCases: IBookUseCases = {
  createListing: jest.fn(),
  listAvailable: jest.fn(),
  getById: jest.fn(),
  listByOwner: jest.fn(),
  updateListing: jest.fn(),
  cancelListing: jest.fn(),
  togglePauseListing: jest.fn(),
  search: jest.fn(),
} as unknown as IBookUseCases;

const fakeRateLimiter = {
  checkAndRecord: jest.fn().mockReturnValue({ allowed: true }),
  checkLimit: jest.fn().mockReturnValue(true),
  recordAttempt: jest.fn(),
  reset: jest.fn(),
} as any;

const fakeLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
} as any;

async function renderHook(metadataService: IBookMetadataService) {
  let result!: ReturnType<typeof useCreateListingViewModel>;
  function HookProbe() {
    result = useCreateListingViewModel(fakeUseCases, fakeRateLimiter, fakeLogger, metadataService);
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
  jest.restoreAllMocks();
});

describe("useCreateListingViewModel — Busca por ISBN (Spec 058)", () => {
  it("informa erro caso tente buscar com ISBN vazio", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn(),
    };
    const hook = await renderHook(fakeMetadataService);

    let success = true;
    await act(async () => {
      success = await hook.current[1].lookupIsbn();
    });

    expect(success).toBe(false);
    expect(hook.current[0].isbnFeedback).toEqual({
      type: "info",
      message: "Digite o código ISBN para buscar.",
    });
    expect(fakeMetadataService.lookupByIsbn).not.toHaveBeenCalled();
  });

  it("informa erro caso o ISBN seja inválido", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn(),
    };
    const hook = await renderHook(fakeMetadataService);

    act(() => {
      hook.current[1].setIsbn("12345");
    });

    let success = true;
    await act(async () => {
      success = await hook.current[1].lookupIsbn();
    });

    expect(success).toBe(false);
    expect(hook.current[0].isbnFeedback?.type).toBe("error");
  });

  it("preenche título, autor e capa quando o livro é encontrado", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn().mockResolvedValue({
        isbn: "9788535914849",
        title: "Dom Casmurro",
        author: "Machado de Assis",
        coverUrl: "https://exemplo.com/capa.jpg",
      }),
    };
    const hook = await renderHook(fakeMetadataService);

    act(() => {
      hook.current[1].setIsbn("978-85-359-1484-9");
    });

    let success = false;
    await act(async () => {
      success = await hook.current[1].lookupIsbn();
    });

    expect(success).toBe(true);
    expect(hook.current[0].title).toBe("Dom Casmurro");
    expect(hook.current[0].author).toBe("Machado de Assis");
    expect(hook.current[0].photoUrl).toBe("https://exemplo.com/capa.jpg");
    expect(hook.current[0].isbnFeedback?.type).toBe("success");
  });

  it("guarda sinopse, editora, páginas e ano do ISBN e os envia ao cadastrar o anúncio (Spec 097)", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn().mockResolvedValue({
        isbn: "9788535914849",
        title: "1984",
        author: "George Orwell",
        synopsis: "Distopia futurista.",
        publisher: "Companhia das Letras",
        pageCount: 416,
        publicationYear: 2009,
      }),
    };
    const hook = await renderHook(fakeMetadataService);
    act(() => { hook.current[1].setIsbn("978-85-359-1484-9"); });
    await act(async () => { await hook.current[1].lookupIsbn(); });
    expect(hook.current[0].edition).toEqual({
      synopsis: "Distopia futurista.",
      publisher: "Companhia das Letras",
      pageCount: 416,
      publicationYear: 2009,
    });

    const createListing = jest.fn().mockResolvedValue({ id: "novo" });
    (fakeUseCases as unknown as { createListing: unknown }).createListing = createListing;
    act(() => { hook.current[1].setCondition("good"); hook.current[1].setPrice("20"); });
    await act(async () => { await hook.current[1].submit("dono"); });
    expect(createListing).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "1984",
        synopsis: "Distopia futurista.",
        publisher: "Companhia das Letras",
        pageCount: 416,
        publicationYear: 2009,
      }),
      "dono",
    );
  });

  it("uma nova busca troca a edição; sem dados da edição, o anúncio vai sem sinopse", async () => {
    const lookupByIsbn = jest
      .fn()
      .mockResolvedValueOnce({ isbn: "9788535914849", title: "1984", author: "George Orwell", synopsis: "Primeira." })
      .mockResolvedValueOnce({ isbn: "9788535902778", title: "Outro", author: "Autor" });
    const hook = await renderHook({ lookupByIsbn });
    act(() => { hook.current[1].setIsbn("978-85-359-1484-9"); });
    await act(async () => { await hook.current[1].lookupIsbn(); });
    expect(hook.current[0].edition.synopsis).toBe("Primeira.");
    act(() => { hook.current[1].setIsbn("978-85-359-0277-8"); });
    await act(async () => { await hook.current[1].lookupIsbn(); });
    expect(hook.current[0].edition).toEqual({});
  });

  it("orienta preenchimento manual quando o exemplar não é encontrado", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn().mockResolvedValue(null),
    };
    const hook = await renderHook(fakeMetadataService);

    act(() => {
      hook.current[1].setIsbn("978-85-359-1484-9");
    });

    let success = true;
    await act(async () => {
      success = await hook.current[1].lookupIsbn();
    });

    expect(success).toBe(false);
    expect(hook.current[0].isbnFeedback?.type).toBe("info");
    expect(hook.current[0].isbnFeedback?.message).toContain("manualmente");
  });

  it("handleBarcodeScanned normaliza código de barras e dispara busca automática (Spec 059)", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: jest.fn().mockResolvedValue({
        isbn: "9788535914849",
        title: "Memórias Póstumas de Brás Cubas",
        author: "Machado de Assis",
        coverUrl: "https://exemplo.com/bras-cubas.jpg",
      }),
    };
    const hook = await renderHook(fakeMetadataService);

    let success = false;
    await act(async () => {
      success = await hook.current[1].handleBarcodeScanned("978-85-359-1484-9");
    });

    expect(success).toBe(true);
    expect(hook.current[0].isbn).toBe("9788535914849");
    expect(hook.current[0].title).toBe("Memórias Póstumas de Brás Cubas");
    expect(hook.current[0].author).toBe("Machado de Assis");
    expect(hook.current[0].photoUrl).toBe("https://exemplo.com/bras-cubas.jpg");
    expect(hook.current[0].isbnFeedback?.type).toBe("success");
    expect(fakeMetadataService.lookupByIsbn).toHaveBeenCalledWith("9788535914849");
  });
});
