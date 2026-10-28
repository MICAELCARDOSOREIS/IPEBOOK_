import { beforeEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryDeliveryDataSource } from "@/infra/datasources/memoryDeliveryDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";

describe("MemoryDeliveryDataSource (Spec 095)", () => {
  let notifications: MemoryNotificationDataSource;
  let deliveries: MemoryDeliveryDataSource;

  beforeEach(() => {
    const books = new MemoryBookDataSource([
      { id: "livro", title: "Dom Casmurro", author: "Machado", ownerId: "dono", modality: "trade", status: "reserved" },
    ]);
    const requests = new MemoryBookRequestDataSource([{ id: "aceito", listingId: "livro", requesterId: "leitora", status: "accepted" }]);
    notifications = new MemoryNotificationDataSource([]);
    deliveries = new MemoryDeliveryDataSource(requests, books, notifications);
  });

  it("avisa o leitor quando quem confirma é o anunciante", async () => {
    const { code } = await deliveries.createCode("aceito", "dono");
    await deliveries.complete("aceito", code, "dono");
    expect((await notifications.listByUser("leitora")).map((a) => a.title)).toEqual(["Entrega confirmada"]);
    expect(await notifications.listByUser("dono")).toHaveLength(0);
  });

  it("sem código gerado, recusa como expirado", async () => {
    await expect(deliveries.complete("aceito", "K7M2QXWA", "leitora")).rejects.toThrow("expirou");
    expect(await deliveries.findByRequest("aceito")).toBeNull();
  });

  it("pedido desconhecido conclui sem aviso", async () => {
    const { code } = await deliveries.createCode("fantasma", "dono");
    const delivery = await deliveries.complete("fantasma", code, "leitora");
    expect(delivery.requestId).toBe("fantasma");
    expect(await notifications.listByUser("dono")).toHaveLength(0);
    expect(await notifications.listByUser("leitora")).toHaveLength(0);
  });
});
