import { describe, expect, it } from "vitest";
import { webColumnCount, webColumnWidth, webContentWidth, webGridColumns, WEB_GUTTER } from "@/view/webLayout";

/** Soma ocupada por `columns` itens de `webColumnWidth` mais os vãos, numa coluna de `available` px. */
function occupied(available: number, columns: number, gapPx: number): number {
  const percent = Number.parseFloat(webColumnWidth(columns));
  return (available * percent * columns) / 100 + gapPx * (columns - 1);
}

describe("webLayout", () => {
  it("as colunas cabem lado a lado com vão de 24 px já na menor janela larga (960 px)", () => {
    const available = webContentWidth(960);
    expect(available).toBe(960 - WEB_GUTTER * 2);
    for (const columns of [2, 3]) {
      expect(occupied(available, columns, 24)).toBeLessThanOrEqual(available);
    }
  });

  it("a grade de livros tem 3, 4 ou 5 colunas conforme a janela", () => {
    expect(webGridColumns(1024)).toBe(3);
    expect(webGridColumns(1440)).toBe(4);
    expect(webGridColumns(1846)).toBe(5);
  });

  it("listas ganham uma coluna só em janelas grandes, sem passar do máximo", () => {
    expect(webColumnCount(1280, 2, 3)).toBe(2);
    expect(webColumnCount(1600, 2, 3)).toBe(3);
    expect(webColumnCount(1600, 2, 2)).toBe(2);
  });
});
