import { beforeEach, describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryMeetingDataSource } from "@/infra/datasources/memoryMeetingDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { MeetingUseCases } from "@/usecase/meetingUseCases";

const AGORA = new Date(2026, 9, 22, 14, 0, 0);
const amanha10h = new Date(2026, 9, 23, 10).toISOString();
const sabado15h = new Date(2026, 9, 24, 15).toISOString();
const PRACA = "Praça da Bandeira (Centro)";
const IFPI = "Campus IFPI Piripiri (Recepção ou Biblioteca)";

describe("combinar encontro (Spec 052)", () => {
  let notifications: MemoryNotificationDataSource;
  let meetings: MemoryMeetingDataSource;
  let useCases: MeetingUseCases;

  beforeEach(() => {
    const books = new MemoryBookDataSource([
      { id: "livro", title: "Dom Casmurro", author: "Machado", ownerId: "dono", modality: "trade", status: "reserved" },
    ]);
    const requests = new MemoryBookRequestDataSource([
      { id: "aceito", listingId: "livro", requesterId: "leitora", status: "accepted" },
      { id: "pendente", listingId: "livro", requesterId: "outra", status: "pending" },
    ]);
    notifications = new MemoryNotificationDataSource([]);
    meetings = new MemoryMeetingDataSource(requests, books, notifications);
    useCases = new MeetingUseCases(meetings, requests, books, () => AGORA);
  });

  it("convite, confirmação pela outra pessoa e avisos para cada lado (RN-05, RN-08)", async () => {
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    expect(convite).toMatchObject({ status: "proposed", proposedBy: "dono", pointName: PRACA });
    expect(await useCases.getMeeting("aceito", "leitora")).toMatchObject({ id: convite.id });

    const [aviso] = await notifications.listByUser("leitora");
    expect(aviso).toMatchObject({ title: "Convite para encontro", type: "meeting_update", actionUrl: "/negociacao/aceito" });

    await expect(useCases.confirm(convite.id, "dono")).rejects.toThrow(/não pode confirmá-lo/);
    const confirmado = await useCases.confirm(convite.id, "leitora");
    expect(confirmado.status).toBe("confirmed");
    expect((await notifications.listByUser("dono"))[0].title).toBe("Encontro confirmado");
  });

  it("reagendar volta a aguardar a confirmação da outra pessoa (RN-06)", async () => {
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    await useCases.confirm(convite.id, "leitora");
    const novo = await useCases.reschedule(convite.id, { pointName: IFPI, scheduledAt: sabado15h }, "leitora");
    expect(novo).toMatchObject({ status: "proposed", proposedBy: "leitora", pointName: IFPI, scheduledAt: sabado15h });
    expect((await notifications.listByUser("dono"))[0].title).toBe("Encontro reagendado");
    await expect(useCases.confirm(convite.id, "leitora")).rejects.toThrow(/não pode confirmá-lo/);
    await expect(useCases.confirm(convite.id, "dono")).resolves.toMatchObject({ status: "confirmed" });
  });

  it("cancelar libera um novo convite; um só encontro ativo por vez (RN-04, RN-07)", async () => {
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    await expect(useCases.propose("aceito", { pointName: IFPI, scheduledAt: sabado15h }, "leitora")).rejects.toThrow(/Já existe/);
    await useCases.cancel(convite.id, "leitora");
    expect((await notifications.listByUser("dono"))[0].title).toBe("Encontro cancelado");
    await expect(useCases.cancel(convite.id, "dono")).rejects.toThrow(/já foi cancelado/);
    await expect(useCases.reschedule(convite.id, { pointName: IFPI, scheduledAt: sabado15h }, "dono")).rejects.toThrow(/cancelado/);
    await expect(useCases.confirm(convite.id, "dono")).rejects.toThrow(/aguardando/);
    const outro = await useCases.propose("aceito", { pointName: IFPI, scheduledAt: sabado15h }, "leitora");
    expect((await useCases.getMeeting("aceito", "dono"))?.id).toBe(outro.id);
  });

  it("só participantes de pedido aceito combinam o encontro (RN-01)", async () => {
    await expect(useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "intrusa")).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.getMeeting("aceito", "intrusa")).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.propose("pendente", { pointName: PRACA, scheduledAt: amanha10h }, "outra")).rejects.toThrow(/aceito/);
    await expect(useCases.propose("inexistente", { pointName: PRACA, scheduledAt: amanha10h }, "dono")).rejects.toBeInstanceOf(ValidationError);
    await expect(useCases.getMeeting("aceito", null)).rejects.toBeInstanceOf(AuthError);
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    await expect(useCases.cancel(convite.id, "intrusa")).rejects.toBeInstanceOf(AuthError);
    await expect(useCases.confirm("nao-existe", "leitora")).rejects.toThrow(/não encontrado/);
  });

  it("recusa local e data inválidos antes de gravar (RN-02, RN-03)", async () => {
    await expect(useCases.propose("aceito", { pointName: "Minha casa", scheduledAt: amanha10h }, "dono")).rejects.toThrow(/pontos de encontro/);
    await expect(useCases.propose("aceito", { pointName: PRACA, scheduledAt: new Date(2026, 9, 21, 10).toISOString() }, "dono")).rejects.toThrow(/entre amanhã/);
    expect(await useCases.getMeeting("aceito", "dono")).toBeNull();
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    await expect(useCases.reschedule(convite.id, { pointName: PRACA, scheduledAt: new Date(2026, 9, 23, 22).toISOString() }, "leitora")).rejects.toThrow(/horários/);
  });

  it("não sobrescreve mudança concorrente no datasource", async () => {
    const convite = await useCases.propose("aceito", { pointName: PRACA, scheduledAt: amanha10h }, "dono");
    await expect(meetings.update(convite.id, { status: "confirmed" }, "confirmed", "leitora")).rejects.toBeInstanceOf(DataSourceError);
    await expect(meetings.create({ requestId: "aceito", pointName: IFPI, scheduledAt: sabado15h, proposedBy: "dono" })).rejects.toBeInstanceOf(DataSourceError);
    expect(await meetings.findById("nao-existe")).toBeNull();
  });
});
