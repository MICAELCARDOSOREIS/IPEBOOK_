import { beforeEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryDeliveryDataSource } from "@/infra/datasources/memoryDeliveryDataSource";
import { MemoryMeetingDataSource } from "@/infra/datasources/memoryMeetingDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { DeliveryUseCases } from "@/usecase/deliveryUseCases";

const PRACA = "Praça da Bandeira (Centro)";
const amanha = new Date(2026, 9, 29, 10).toISOString();

describe("concluir a entrega por QR code (Spec 095)", () => {
  let clock: Date;
  let notifications: MemoryNotificationDataSource;
  let meetings: MemoryMeetingDataSource;
  let useCases: DeliveryUseCases;

  beforeEach(() => {
    clock = new Date(2026, 9, 29, 10, 0, 0);
    const books = new MemoryBookDataSource([
      { id: "livro", title: "Dom Casmurro", author: "Machado", ownerId: "dono", modality: "trade", status: "reserved" },
    ]);
    const requests = new MemoryBookRequestDataSource([
      { id: "aceito", listingId: "livro", requesterId: "leitora", status: "accepted" },
      { id: "pendente", listingId: "livro", requesterId: "outra", status: "pending" },
    ]);
    notifications = new MemoryNotificationDataSource([]);
    meetings = new MemoryMeetingDataSource(requests, books, notifications);
    const deliveries = new MemoryDeliveryDataSource(requests, books, notifications, () => clock);
    useCases = new DeliveryUseCases(deliveries, requests, books, meetings);
  });

  async function confirmedMeeting() {
    const meeting = await meetings.create({ requestId: "aceito", pointName: PRACA, scheduledAt: amanha, proposedBy: "dono" });
    await meetings.update(meeting.id, { status: "confirmed" }, "proposed", "leitora");
  }

  it("CA1: sem encontro confirmado, não gera nem confirma", async () => {
    await expect(useCases.generateCode("aceito", "dono")).rejects.toThrow("Confirme o encontro");
    await meetings.create({ requestId: "aceito", pointName: PRACA, scheduledAt: amanha, proposedBy: "dono" });
    await expect(useCases.generateCode("aceito", "dono")).rejects.toBeInstanceOf(ValidationError);
  });

  it("CA2: só o anunciante gera e só o leitor confirma", async () => {
    await confirmedMeeting();
    await expect(useCases.generateCode("aceito", "leitora")).rejects.toThrow("Só quem anunciou");
    const { code } = await useCases.generateCode("aceito", "dono");
    await expect(useCases.confirmDelivery("aceito", code, "dono")).rejects.toThrow("Só quem recebe");
    await expect(useCases.generateCode("aceito", "estranho")).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.getRole("aceito", "dono")).resolves.toBe("giver");
    await expect(useCases.getRole("aceito", "leitora")).resolves.toBe("receiver");
  });

  it("exige sessão e negociação aceita", async () => {
    await expect(useCases.generateCode("aceito", null)).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.generateCode("pendente", "dono")).rejects.toBeInstanceOf(ValidationError);
  });

  it("CA4: o código certo conclui, avisa o anunciante e não se repete (RN-05, RN-06)", async () => {
    await confirmedMeeting();
    const { code } = await useCases.generateCode("aceito", "dono");
    expect(code).toMatch(/^[23456789A-HJKMNP-Z]{8}$/);

    const delivery = await useCases.confirmDelivery("aceito", ` ${code.toLowerCase()} `, "leitora");
    expect(delivery).toMatchObject({ requestId: "aceito", completedBy: "leitora" });
    await expect(useCases.getDelivery("aceito", "dono")).resolves.toMatchObject({ requestId: "aceito" });

    const avisos = await notifications.listByUser("dono");
    expect(avisos.map((a) => a.title)).toContain("Entrega confirmada");

    await expect(useCases.confirmDelivery("aceito", code, "leitora")).rejects.toThrow("já foi concluída");
    await expect(useCases.generateCode("aceito", "dono")).rejects.toThrow("já foi concluída");
  });

  it("CA3: código com formato inválido, errado, expirado ou bloqueado é recusado", async () => {
    await confirmedMeeting();
    await expect(useCases.confirmDelivery("aceito", "123", "leitora")).rejects.toThrow("Código inválido");

    const { code } = await useCases.generateCode("aceito", "dono");
    const errado = code[0] === "A" ? "BBBBBBBB" : "AAAAAAAA";
    for (let i = 0; i < 5; i += 1) {
      await expect(useCases.confirmDelivery("aceito", errado, "leitora")).rejects.toThrow("Código incorreto");
    }
    await expect(useCases.confirmDelivery("aceito", code, "leitora")).rejects.toThrow("Muitas tentativas");

    const novo = await useCases.generateCode("aceito", "dono");
    clock = new Date(clock.getTime() + 16 * 60_000);
    await expect(useCases.confirmDelivery("aceito", novo.code, "leitora")).rejects.toBeInstanceOf(DataSourceError);
    await expect(useCases.confirmDelivery("aceito", novo.code, "leitora")).rejects.toThrow("expirou");
  });

  it("gerar um código novo invalida o anterior (RN-03)", async () => {
    await confirmedMeeting();
    const primeiro = await useCases.generateCode("aceito", "dono");
    const segundo = await useCases.generateCode("aceito", "dono");
    if (primeiro.code !== segundo.code) {
      await expect(useCases.confirmDelivery("aceito", primeiro.code, "leitora")).rejects.toThrow("Código incorreto");
    }
    await expect(useCases.confirmDelivery("aceito", segundo.code, "leitora")).resolves.toBeDefined();
  });
});
