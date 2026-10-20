import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it } from "vitest";
import { MemorySearchHistoryDataSource } from "@/infra/datasources/memorySearchHistoryDataSource";
import type { IBookUseCases } from "@/usecase/iBookUseCases";
import type { ISearchHistoryUseCases } from "@/usecase/iSearchHistoryUseCases";
import { SearchHistoryUseCases } from "@/usecase/searchHistoryUseCases";
import { useSearchViewModel } from "@/viewmodel/useSearchViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(
  useCases: Pick<IBookUseCases, "listBooks">,
  userId: string | null = null,
  history: ISearchHistoryUseCases = new SearchHistoryUseCases(new MemorySearchHistoryDataSource()),
) {
  let result!: ReturnType<typeof useSearchViewModel>;
  function HookProbe() {
    result = useSearchViewModel(userId, useCases as IBookUseCases, history);
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

const books = [
  { id: "1", title: "Dom Casmurro", author: "Machado de Assis", ownerId: "u1", modality: "donation" as const, status: "available" as const },
  { id: "2", title: "Capitães da Areia", author: "Jorge Amado", ownerId: "u2", modality: "trade" as const, status: "available" as const },
];

describe("testes de hook: useSearchViewModel (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("sem termo, mostra o catálogo completo já carregado", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    expect(hook.current[0].books).toEqual(books);
  });

  it("filtra por título sem diferenciar maiúsculas/minúsculas", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("dom cas");
    });
    expect(hook.current[0].books).toEqual([books[0]]);
  });

  it("filtra por autor sem diferenciar maiúsculas/minúsculas", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("JORGE");
    });
    expect(hook.current[0].books).toEqual([books[1]]);
  });

  it("filtra por categoria quando o anúncio a informa", async () => {
    const categorized = { ...books[0], category: "Romance" };
    const hook = await renderHook({ listBooks: async () => [categorized, books[1]] });
    await act(async () => { hook.current[1].setTerm("romance"); });
    expect(hook.current[0].books).toEqual([categorized]);
  });

  it("retorna lista vazia quando nenhum livro corresponde ao termo", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("inexistente");
    });
    expect(hook.current[0].books).toEqual([]);
  });

  it("limpar o termo volta a mostrar o catálogo completo", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("dom cas");
    });
    await act(async () => {
      hook.current[1].setTerm("");
    });
    expect(hook.current[0].books).toEqual(books);
  });

  it("não chama listBooks de novo ao mudar o termo (filtro client-side, FR-005)", async () => {
    let calls = 0;
    const hook = await renderHook({
      listBooks: async () => {
        calls += 1;
        return books;
      },
    });
    await act(async () => {
      hook.current[1].setTerm("dom");
    });
    await act(async () => {
      hook.current[1].setTerm("dom casmurro");
    });
    expect(calls).toBe(1);
  });

  it("guarda termos buscados, evita duplicar e limita a 10 itens", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    const hook = await renderHook({ listBooks: async () => books }, "leitor", history);
    for (let i = 0; i < 11; i += 1) {
      await act(async () => { await hook.current[1].registerSearch(`termo-${i}`); });
    }
    await act(async () => { await hook.current[1].registerSearch("termo-5"); });
    expect(hook.current[0].history).toHaveLength(10);
    expect(hook.current[0].history[0]).toBe("termo-5");
    expect(hook.current[0].history.filter((item) => item === "termo-5")).toHaveLength(1);
  });

  it("isola o histórico por conta e limpa só a conta atual", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    await history.registerSearch("outra-conta", "Iracema");
    const hook = await renderHook({ listBooks: async () => books }, "leitor", history);
    await act(async () => { await hook.current[1].registerSearch("Casmurro"); });
    expect(hook.current[0].history).toEqual(["Casmurro"]);
    await act(async () => { await hook.current[1].clearHistory(); });
    expect(hook.current[0].history).toEqual([]);
    expect(await history.listTerms("outra-conta")).toEqual(["Iracema"]);
  });

  it("ignora termo vazio ao registrar busca", async () => {
    const history = new SearchHistoryUseCases(new MemorySearchHistoryDataSource());
    const hook = await renderHook({ listBooks: async () => books }, "leitor", history);
    await act(async () => { await hook.current[1].registerSearch("   "); });
    expect(hook.current[0].history).toEqual([]);
  });

  it("filtra livros por modalidade (Issue #93)", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setModality("trade");
    });
    expect(hook.current[0].books).toEqual([books[1]]);

    await act(async () => {
      hook.current[1].setModality("donation");
    });
    expect(hook.current[0].books).toEqual([books[0]]);

    await act(async () => {
      hook.current[1].setModality("all");
    });
    expect(hook.current[0].books).toEqual(books);
  });

  it("ordena livros por título em ordem alfabética (Issue #93)", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setSortBy("title");
    });
    // Capitães da Areia deve vir antes de Dom Casmurro
    expect(hook.current[0].books[0].title).toBe("Capitães da Areia");
    expect(hook.current[0].books[1].title).toBe("Dom Casmurro");
  });

  it("filtra livros por categoria específica e expõe availableCategories (Spec 028, Issue #93)", async () => {
    const list = [
      { id: "1", title: "Dom Casmurro", author: "Machado", ownerId: "u1", modality: "donation" as const, status: "available" as const, category: "Literatura Brasileira" },
      { id: "2", title: "Cálculo I", author: "Stewart", ownerId: "u2", modality: "sale" as const, status: "available" as const, category: "Didáticos", price: 50 },
    ];
    const hook = await renderHook({ listBooks: async () => list });
    expect(hook.current[0].availableCategories).toEqual(["Didáticos", "Literatura Brasileira"]);

    await act(async () => {
      hook.current[1].setCategory("Didáticos");
    });
    expect(hook.current[0].books).toEqual([list[1]]);

    await act(async () => {
      hook.current[1].setCategory("all");
    });
    expect(hook.current[0].books).toEqual(list);
  });

  it("filtra livros por faixa de preço e itens gratuitos (Spec 028, Issue #93)", async () => {
    const list = [
      { id: "1", title: "Livro Doação", author: "Autor A", ownerId: "u1", modality: "donation" as const, status: "available" as const },
      { id: "2", title: "Livro Barato", author: "Autor B", ownerId: "u2", modality: "sale" as const, status: "available" as const, price: 15 },
      { id: "3", title: "Livro Médio", author: "Autor C", ownerId: "u3", modality: "sale" as const, status: "available" as const, price: 35 },
      { id: "4", title: "Livro Caro", author: "Autor D", ownerId: "u4", modality: "sale" as const, status: "available" as const, price: 80 },
    ];
    const hook = await renderHook({ listBooks: async () => list });

    // Apenas gratuitos (doação ou preço 0)
    await act(async () => {
      hook.current[1].setPriceRange("free");
    });
    expect(hook.current[0].books).toEqual([list[0]]);

    // Até R$ 20
    await act(async () => {
      hook.current[1].setPriceRange("under20");
    });
    expect(hook.current[0].books).toEqual([list[1]]);

    // Até R$ 50
    await act(async () => {
      hook.current[1].setPriceRange("under50");
    });
    expect(hook.current[0].books).toEqual([list[1], list[2]]);

    // Todos os preços
    await act(async () => {
      hook.current[1].setPriceRange("all");
    });
    expect(hook.current[0].books).toEqual(list);
  });

  it("ordena por menor e maior preço (Spec 028, Issue #93)", async () => {
    const list = [
      { id: "1", title: "Livro 40", author: "A", ownerId: "u1", modality: "sale" as const, status: "available" as const, price: 40 },
      { id: "2", title: "Livro 10", author: "B", ownerId: "u2", modality: "sale" as const, status: "available" as const, price: 10 },
      { id: "3", title: "Livro 90", author: "C", ownerId: "u3", modality: "sale" as const, status: "available" as const, price: 90 },
    ];
    const hook = await renderHook({ listBooks: async () => list });

    await act(async () => {
      hook.current[1].setSortBy("price_asc");
    });
    expect(hook.current[0].books.map((b) => b.price)).toEqual([10, 40, 90]);

    await act(async () => {
      hook.current[1].setSortBy("price_desc");
    });
    expect(hook.current[0].books.map((b) => b.price)).toEqual([90, 40, 10]);
  });

  it("reseta todos os filtros ao chamar clearFilters (Spec 028, Issue #93)", async () => {
    const hook = await renderHook({ listBooks: async () => books });
    await act(async () => {
      hook.current[1].setTerm("dom");
      hook.current[1].setModality("donation");
      hook.current[1].setCategory("Ficção");
      hook.current[1].setPriceRange("under20");
      hook.current[1].setSortBy("title");
    });
    expect(hook.current[0].hasActiveFilters).toBe(true);

    await act(async () => {
      hook.current[1].clearFilters();
    });
    expect(hook.current[0].term).toBe("");
    expect(hook.current[0].modality).toBe("all");
    expect(hook.current[0].category).toBe("all");
    expect(hook.current[0].priceRange).toBe("all");
    expect(hook.current[0].sortBy).toBe("recent");
    expect(hook.current[0].hasActiveFilters).toBe(false);
    expect(hook.current[0].books).toEqual(books);
  });
});
