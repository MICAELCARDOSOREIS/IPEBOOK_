import { describe, expect, it, vi } from "vitest";
import { OPEN_GRAPH_BOOK_COLUMNS, onRequest } from "../../functions/livro/[id]";
import { BOOK_COLUMNS } from "@/infra/datasources/supabaseBookDataSource";

describe("Cloudflare Pages Function /livro/[id] (Spec 119)", () => {
  it("enriquece HTML com metadados do livro ao consultar Supabase com sucesso", async () => {
    const mockBook = {
      id: "livro-teste-1",
      title: "Torto Arado",
      author: "Itamar Vieira Junior",
      modality: "sale" as const,
      price: 32,
      photo_url: "https://imagens.exemplo.com/torto-arado.jpg",
      neighborhood: "Fonte dos Matos",
      is_box: false,
      box_volumes_count: null,
    };

    const originalHtml = `<!DOCTYPE html><html><head><title>IpêBook</title></head><body><div id="root"></div></body></html>`;

    const fakeNext = vi.fn().mockResolvedValue(
      new Response(originalHtml, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );

    // Mock global fetch para simular resposta do Supabase REST
    const originalFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockBook],
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    try {
      const response = await onRequest({
        request: new Request("https://ipebook.app/livro/livro-teste-1"),
        params: { id: "livro-teste-1" },
        env: {
          EXPO_PUBLIC_SUPABASE_URL: "https://fake.supabase.co",
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fake-key",
        },
        next: fakeNext,
        functionPath: "/livro/[id]",
        waitUntil: () => {},
        data: {},
      });

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toContain("<title>Torto Arado · Itamar Vieira Junior | IpêBook Piripiri</title>");
      expect(text).toContain('<meta property="og:title" content="Torto Arado · Itamar Vieira Junior | IpêBook Piripiri" />');
      expect(text).toContain('<meta property="og:image" content="https://imagens.exemplo.com/torto-arado.jpg" />');
      expect(text).toContain("Fonte dos Matos");
      expect(text).toContain("Venda: R$ 32,00");

      const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
      expect(requestedUrl.searchParams.get("select")).toBe(OPEN_GRAPH_BOOK_COLUMNS.join(","));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("retorna o HTML original caso o livro não seja encontrado no Supabase", async () => {
    const originalHtml = `<!DOCTYPE html><html><head><title>IpêBook</title></head><body></body></html>`;
    const fakeNext = vi.fn().mockResolvedValue(
      new Response(originalHtml, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as unknown as Response);

    try {
      const response = await onRequest({
        request: new Request("https://ipebook.app/livro/inexistente"),
        params: { id: "inexistente" },
        env: {
          EXPO_PUBLIC_SUPABASE_URL: "https://fake.supabase.co",
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fake-key",
        },
        next: fakeNext,
        functionPath: "/livro/[id]",
        waitUntil: () => {},
        data: {},
      });

      const text = await response.text();
      expect(text).toBe(originalHtml);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("consulta apenas colunas que existem em v2_books (mesmas lidas pelo app)", () => {
    const realColumns = new Set(BOOK_COLUMNS.split(","));
    const unknown = OPEN_GRAPH_BOOK_COLUMNS.filter((column) => !realColumns.has(column));
    expect(unknown).toEqual([]);
  });
});
