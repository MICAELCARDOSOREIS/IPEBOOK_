import { describe, expect, it, vi } from "vitest";
import type { ILocalCacheDataSource } from "@/model/datasources/iLocalCacheDataSource";
import { LocalCacheUseCases } from "@/usecase/localCacheUseCases";

describe("LocalCacheUseCases — limpeza de dados no dispositivo (Spec 073)", () => {
  it("delega a limpeza do catálogo offline para a fonte de dados", async () => {
    const dataSource: ILocalCacheDataSource = { clearBooksCache: vi.fn().mockResolvedValue(undefined) };
    const useCases = new LocalCacheUseCases(dataSource);

    await useCases.clearBooksCache();

    expect(dataSource.clearBooksCache).toHaveBeenCalledTimes(1);
  });

  it("propaga falha da fonte de dados para o chamador tratar o erro", async () => {
    const dataSource: ILocalCacheDataSource = {
      clearBooksCache: vi.fn().mockRejectedValue(new Error("storage indisponível")),
    };
    const useCases = new LocalCacheUseCases(dataSource);

    await expect(useCases.clearBooksCache()).rejects.toThrow("storage indisponível");
  });
});
