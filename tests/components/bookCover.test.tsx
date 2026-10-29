import React from "react";
import { act, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BookCover } from "@/view/components/BookCover";
import { bookCoverCache } from "@/viewmodel/bookCoverCache";

describe("BookCover (design-system/04-componentes/capa-ilustrativa.md e Spec 040)", () => {
  beforeEach(() => {
    bookCoverCache.clear();
  });

  it("usa o título como texto alternativo acessível e accessibilityRole image", async () => {
    const { getByLabelText } = await render(<BookCover id="a1" title="Dom Casmurro" />);
    const elemento = getByLabelText("Capa ilustrativa de Dom Casmurro");
    expect(elemento).toBeDefined();
    expect(elemento.props.accessibilityRole).toBe("image");
  });

  it("gera a mesma cor para o mesmo id (determinístico, não aleatório)", async () => {
    const { getByLabelText: getFirst } = await render(<BookCover id="mesmo-id" title="Livro A" />);
    const { getByLabelText: getSecond } = await render(<BookCover id="mesmo-id" title="Livro B" />);
    const firstStyle = getFirst("Capa ilustrativa de Livro A").props.style;
    const secondStyle = getSecond("Capa ilustrativa de Livro B").props.style;
    const flatten = (style: unknown) => (Array.isArray(style) ? Object.assign({}, ...style) : style);
    expect(flatten(firstStyle).backgroundColor).toBe(flatten(secondStyle).backgroundColor);
  });

  it("variante em lista (44px) não sobrepõe texto sobre a arte", async () => {
    const { queryByText } = await render(<BookCover id="a1" title="Dom Casmurro" variant="list" />);
    expect(queryByText("Dom Casmurro")).toBeNull();
  });

  it("variante em cartão (≥80px) sobrepõe título e autor", async () => {
    const { getByText } = await render(
      <BookCover id="a1" title="Dom Casmurro" author="Machado de Assis" variant="card" />,
    );
    expect(getByText("Dom Casmurro")).toBeDefined();
    expect(getByText("Machado de Assis")).toBeDefined();
  });

  it("renderiza imagem real quando photoUrl é fornecido", async () => {
    const { getByLabelText } = await render(
      <BookCover
        id="a1"
        title="Dom Casmurro"
        photoUrl="https://imagens.ipebook.app/capas/casmurro.jpg"
      />,
    );
    const imagem = getByLabelText("Foto da capa de Dom Casmurro");
    expect(imagem).toBeDefined();
    expect(imagem.props.accessibilityRole).toBe("image");
  });

  it("exibe placeholder/skeleton progressivo com acessibilidade durante o carregamento inicial (RN-05, RN-06)", async () => {
    const { getByTestId, getByLabelText } = await render(
      <BookCover
        id="a1"
        title="O Cortiço"
        photoUrl="https://imagens.ipebook.app/capas/cortico.jpg"
      />,
    );

    const skeleton = getByTestId("book-cover-skeleton");
    expect(skeleton).toBeDefined();
    expect(skeleton.props.accessibilityRole).toBe("image");
    expect(getByLabelText("Carregando capa de O Cortiço")).toBeDefined();
  });

  it("remove o skeleton e exibe a imagem definitiva após onLoad com sucesso", async () => {
    const { getByLabelText, queryByTestId } = await render(
      <BookCover
        id="a1"
        title="Iracema"
        photoUrl="https://imagens.ipebook.app/capas/iracema.jpg"
      />,
    );

    const imagem = getByLabelText("Foto da capa de Iracema");
    expect(queryByTestId("book-cover-skeleton")).not.toBeNull();

    await act(async () => {
      imagem.props.onLoad();
    });

    // Após o onLoad, o skeleton deve ser removido
    expect(queryByTestId("book-cover-skeleton")).toBeNull();
    expect(bookCoverCache.isLoaded("https://imagens.ipebook.app/capas/iracema.jpg")).toBe(true);
  });

  it("renderiza imediatamente sem skeleton se a URL já estiver no cache (RN-01)", async () => {
    bookCoverCache.setLoaded("https://imagens.ipebook.app/capas/ja-cacheada.jpg");

    const { getByLabelText, queryByTestId } = await render(
      <BookCover
        id="a1"
        title="Memórias Póstumas"
        photoUrl="https://imagens.ipebook.app/capas/ja-cacheada.jpg"
      />,
    );

    // Como já está em cache, não exibe skeleton
    expect(queryByTestId("book-cover-skeleton")).toBeNull();
    const imagem = getByLabelText("Foto da capa de Memórias Póstumas");
    expect(imagem).toBeDefined();
    expect(imagem.props.accessibilityRole).toBe("image");
  });

  it("recorre ao fallback gracioso da capa ilustrativa após esgotamento de retries (RN-03, RN-04)", async () => {
    vi.useFakeTimers();
    try {
      const { getByLabelText, queryByTestId } = await render(
        <BookCover
          id="livro-retry-id"
          title="Auto da Compadecida"
          photoUrl="https://imagens.ipebook.app/capas/auto.jpg"
          maxRetries={1}
          initialBackoffMs={100}
          timeoutMs={1000}
        />,
      );

      const imagem = getByLabelText("Foto da capa de Auto da Compadecida");

      // 1º erro (onError) -> agenda retry 1
      await act(async () => {
        imagem.props.onError();
      });

      // Avança o backoff
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 2º erro -> esgota retries e cai no fallback
      const imagemRetry = getByLabelText("Foto da capa de Auto da Compadecida");
      await act(async () => {
        imagemRetry.props.onError();
      });

      // Skeleton removido e capa ilustrativa exibida
      expect(queryByTestId("book-cover-skeleton")).toBeNull();
      const fallback = getByLabelText("Capa ilustrativa de Auto da Compadecida");
      expect(fallback).toBeDefined();
      expect(fallback.props.accessibilityRole).toBe("image");
      expect(bookCoverCache.hasFailed("https://imagens.ipebook.app/capas/auto.jpg")).toBe(true);
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });

  it("aciona retry e fallback gracioso quando expira o timeout (RN-02)", async () => {
    vi.useFakeTimers();
    try {
      const { getByLabelText, queryByTestId } = await render(
        <BookCover
          id="timeout-id"
          title="Grande Sertão: Veredas"
          photoUrl="https://imagens.ipebook.app/capas/timeout.jpg"
          maxRetries={1}
          initialBackoffMs={100}
          timeoutMs={500}
        />,
      );

      // Expira o 1º timeout de 500ms
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Avança o backoff de 100ms
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Expira o 2º timeout de 500ms (esgotando os retries)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(queryByTestId("book-cover-skeleton")).toBeNull();
      expect(getByLabelText("Capa ilustrativa de Grande Sertão: Veredas")).toBeDefined();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
