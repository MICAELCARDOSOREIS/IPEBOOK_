import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import { useCreateListingViewModel } from "@/viewmodel/useCreateListingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

const fakeUseCases: IBookUseCases = {
  createListing: vi.fn(),
  listAvailable: vi.fn(),
  getById: vi.fn(),
  listByOwner: vi.fn(),
  updateListing: vi.fn(),
  cancelListing: vi.fn(),
  togglePauseListing: vi.fn(),
  search: vi.fn(),
} as unknown as IBookUseCases;

const fakeRateLimiter = {
  checkLimit: vi.fn().mockReturnValue(true),
  recordAttempt: vi.fn(),
  reset: vi.fn(),
} as any;

const fakeLogger = {
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
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
  vi.restoreAllMocks();
});

describe("useCreateListingViewModel — Busca por ISBN (Spec 058)", () => {
  it("informa erro caso tente buscar com ISBN vazio", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: vi.fn(),
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
      lookupByIsbn: vi.fn(),
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
      lookupByIsbn: vi.fn().mockResolvedValue({
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

  it("orienta preenchimento manual quando o exemplar não é encontrado", async () => {
    const fakeMetadataService: IBookMetadataService = {
      lookupByIsbn: vi.fn().mockResolvedValue(null),
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
});
