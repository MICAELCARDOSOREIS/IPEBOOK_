import { beforeEach, describe, expect, it } from "vitest";
import { BookCoverCache, bookCoverCache } from "@/viewmodel/bookCoverCache";

describe("BookCoverCache (Spec 040, ADR 0034)", () => {
  beforeEach(() => {
    bookCoverCache.clear();
  });

  it("começa vazio e retorna undefined para URL desconhecida", () => {
    const cache = new BookCoverCache(5);
    expect(cache.size()).toBe(0);
    expect(cache.getStatus("https://example.com/livro.jpg")).toBeUndefined();
    expect(cache.isLoaded("https://example.com/livro.jpg")).toBe(false);
    expect(cache.hasFailed("https://example.com/livro.jpg")).toBe(false);
  });

  it("registra e recupera status loaded", () => {
    const cache = new BookCoverCache(5);
    cache.setLoaded("https://example.com/livro-1.jpg");
    expect(cache.getStatus("https://example.com/livro-1.jpg")).toBe("loaded");
    expect(cache.isLoaded("https://example.com/livro-1.jpg")).toBe(true);
    expect(cache.hasFailed("https://example.com/livro-1.jpg")).toBe(false);
  });

  it("registra e recupera status error", () => {
    const cache = new BookCoverCache(5);
    cache.setError("https://example.com/livro-falho.jpg");
    expect(cache.getStatus("https://example.com/livro-falho.jpg")).toBe("error");
    expect(cache.isLoaded("https://example.com/livro-falho.jpg")).toBe(false);
    expect(cache.hasFailed("https://example.com/livro-falho.jpg")).toBe(true);
  });

  it("permite deletar e limpar entradas", () => {
    const cache = new BookCoverCache(5);
    cache.setLoaded("https://example.com/a.jpg");
    cache.setLoaded("https://example.com/b.jpg");
    expect(cache.size()).toBe(2);

    expect(cache.delete("https://example.com/a.jpg")).toBe(true);
    expect(cache.size()).toBe(1);
    expect(cache.isLoaded("https://example.com/a.jpg")).toBe(false);

    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it("descarta a entrada mais antiga quando atinge a capacidade máxima (LRU)", () => {
    const cache = new BookCoverCache(3);
    cache.setLoaded("https://example.com/1.jpg");
    cache.setLoaded("https://example.com/2.jpg");
    cache.setLoaded("https://example.com/3.jpg");
    expect(cache.size()).toBe(3);

    // Inserção da 4ª chave deve expulsar a 1ª (mais antiga)
    cache.setLoaded("https://example.com/4.jpg");
    expect(cache.size()).toBe(3);
    expect(cache.isLoaded("https://example.com/1.jpg")).toBe(false);
    expect(cache.isLoaded("https://example.com/2.jpg")).toBe(true);
    expect(cache.isLoaded("https://example.com/3.jpg")).toBe(true);
    expect(cache.isLoaded("https://example.com/4.jpg")).toBe(true);
  });

  it("renova a prioridade da entrada acessada via getStatus/isLoaded", () => {
    const cache = new BookCoverCache(3);
    cache.setLoaded("https://example.com/1.jpg");
    cache.setLoaded("https://example.com/2.jpg");
    cache.setLoaded("https://example.com/3.jpg");

    // Acessa a 1ª chave para renová-la
    expect(cache.isLoaded("https://example.com/1.jpg")).toBe(true);

    // Agora a mais antiga é a 2ª chave
    cache.setLoaded("https://example.com/4.jpg");
    expect(cache.isLoaded("https://example.com/2.jpg")).toBe(false);
    expect(cache.isLoaded("https://example.com/1.jpg")).toBe(true);
    expect(cache.isLoaded("https://example.com/3.jpg")).toBe(true);
    expect(cache.isLoaded("https://example.com/4.jpg")).toBe(true);
  });

  it("atualiza status de uma URL existente para loaded ou error", () => {
    const cache = new BookCoverCache(5);
    cache.setLoaded("https://example.com/livro.jpg");
    expect(cache.getStatus("https://example.com/livro.jpg")).toBe("loaded");

    // Sobrescreve para loaded novamente
    cache.setLoaded("https://example.com/livro.jpg");
    expect(cache.getStatus("https://example.com/livro.jpg")).toBe("loaded");

    // Atualiza para error
    cache.setError("https://example.com/livro.jpg");
    expect(cache.getStatus("https://example.com/livro.jpg")).toBe("error");

    // Sobrescreve error com error
    cache.setError("https://example.com/livro.jpg");
    expect(cache.getStatus("https://example.com/livro.jpg")).toBe("error");
  });

  it("descarta chave antiga ao registrar erro em cache cheio", () => {
    const cache = new BookCoverCache(2);
    cache.setLoaded("https://example.com/1.jpg");
    cache.setLoaded("https://example.com/2.jpg");

    // Adiciona erro quando capacidade máxima (2) está atingida
    cache.setError("https://example.com/falha.jpg");
    expect(cache.size()).toBe(2);
    expect(cache.hasFailed("https://example.com/falha.jpg")).toBe(true);
    expect(cache.isLoaded("https://example.com/1.jpg")).toBe(false);
  });

  it("ignora URLs vazias ao gravar", () => {
    const cache = new BookCoverCache(3);
    cache.setLoaded("");
    cache.setError("");
    expect(cache.size()).toBe(0);
  });
});
