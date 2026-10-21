import { describe, expect, it } from "vitest";
import { MemoryProfileDataSource } from "@/infra/datasources/memoryProfileDataSource";
import { DataSourceError } from "@/model/errors";

describe("MemoryProfileDataSource (spec 006 / issue #55)", () => {
  it("retorna null para perfil inexistente", async () => {
    const dataSource = new MemoryProfileDataSource();
    expect(await dataSource.findById("ana")).toBeNull();
  });

  it("rejeita atualizar um perfil que ainda não foi criado", async () => {
    const dataSource = new MemoryProfileDataSource();
    await expect(dataSource.update("ana", { name: "Ana" })).rejects.toBeInstanceOf(DataSourceError);
  });

  it("atualiza um perfil já criado e preserva joinedAt", async () => {
    const dataSource = new MemoryProfileDataSource();
    const created = await dataSource.ensure("ana", "Usuária");
    const updated = await dataSource.update("ana", { name: "Ana Paula", photoUrl: "https://x/y.png" });
    expect(updated.name).toBe("Ana Paula");
    expect(updated.photoUrl).toBe("https://x/y.png");
    expect(updated.joinedAt).toBe(created.joinedAt);
  });
});
