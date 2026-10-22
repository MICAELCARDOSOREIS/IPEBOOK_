import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryBookRequestDataSource } from "@/infra/datasources/memoryBookRequestDataSource";
import { MemoryMeetingDataSource } from "@/infra/datasources/memoryMeetingDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { ClientRateLimiter } from "@/infra/services/clientRateLimiter";
import type { ILogger } from "@/model/services/iLogger";
import { MeetingUseCases } from "@/usecase/meetingUseCases";
import type { IMeetingUseCases } from "@/usecase/iMeetingUseCases";
import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { useScheduleMeetingViewModel } from "@/viewmodel/useScheduleMeetingViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];
const AGORA = new Date(2026, 9, 22, 14, 0, 0);
const agora = () => AGORA;
const PRACA = "Praça da Bandeira (Centro)";
const logger: ILogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

let useCases: MeetingUseCases;

beforeEach(() => {
  const books = new MemoryBookDataSource([
    { id: "livro", title: "Dom Casmurro", author: "Machado", ownerId: "dono", modality: "trade", status: "reserved" },
  ]);
  const requests = new MemoryBookRequestDataSource([
    { id: "aceito", listingId: "livro", requesterId: "leitora", status: "accepted" },
  ]);
  useCases = new MeetingUseCases(new MemoryMeetingDataSource(requests, books, new MemoryNotificationDataSource([])), requests, books, agora);
});

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

async function renderSchedule(userId: string, cases: IMeetingUseCases = useCases) {
  let result!: ReturnType<typeof useScheduleMeetingViewModel>;
  const limiter = new ClientRateLimiter();
  function Probe() {
    result = useScheduleMeetingViewModel("aceito", userId, cases, agora, limiter, logger);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return { get current() { return result; } };
}

async function renderMeeting(userId: string, cases: IMeetingUseCases = useCases) {
  let result!: ReturnType<typeof useMeetingViewModel>;
  const limiter = new ClientRateLimiter();
  function Probe() {
    result = useMeetingViewModel("aceito", userId, cases, limiter, logger);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(Probe)));
  });
  return { get current() { return result; } };
}

describe("useScheduleMeetingViewModel (Spec 052, 06.04/06.13)", () => {
  it("oferece sete dias e as faixas de horário, e exige as três escolhas", async () => {
    const hook = await renderSchedule("dono");
    const [state, actions] = hook.current;
    expect(state).toMatchObject({ mode: "propose", loading: false, pointName: null, timeSlots: [9, 10, 15, 17] });
    expect(state.dayOptions).toHaveLength(7);
    await act(async () => { expect(await actions.submit()).toBe(false); });
    expect(hook.current[0].error).toMatch(/local, o dia e o horário/);
  });

  it("envia o convite com o dia e a faixa escolhidos", async () => {
    const hook = await renderSchedule("dono");
    await act(async () => {
      hook.current[1].selectPoint(PRACA);
      hook.current[1].selectDay(1);
      hook.current[1].selectHour(15);
    });
    await act(async () => { expect(await hook.current[1].submit()).toBe(true); });
    const meeting = await useCases.getMeeting("aceito", "leitora");
    expect(meeting?.pointName).toBe(PRACA);
    expect(new Date(meeting!.scheduledAt).getDate()).toBe(24);
    expect(new Date(meeting!.scheduledAt).getHours()).toBe(15);
  });

  it("com encontro ativo, entra em reagendar já preenchido", async () => {
    await useCases.propose("aceito", { pointName: PRACA, scheduledAt: new Date(2026, 9, 25, 10).toISOString() }, "dono");
    const hook = await renderSchedule("leitora");
    expect(hook.current[0]).toMatchObject({ mode: "reschedule", pointName: PRACA, dayIndex: 2, hour: 10 });
    await act(async () => { hook.current[1].selectHour(17); });
    await act(async () => { expect(await hook.current[1].submit()).toBe(true); });
    const meeting = await useCases.getMeeting("aceito", "dono");
    expect(meeting).toMatchObject({ status: "proposed", proposedBy: "leitora" });
    expect(new Date(meeting!.scheduledAt).getHours()).toBe(17);
  });

  it("mostra o erro de domínio e o de carga", async () => {
    const failing: IMeetingUseCases = { ...useCases, getMeeting: vi.fn().mockRejectedValue(new Error("rede")) } as unknown as IMeetingUseCases;
    const broken = await renderSchedule("dono", failing);
    expect(broken.current[0].loadError).toMatch(/Não foi possível carregar/);

    const intrusa = await renderSchedule("intrusa");
    expect(intrusa.current[0].loadError).toMatch(/não participa/);
  });
});

describe("useMeetingViewModel (Spec 052, 06.05/06.11)", () => {
  it("carrega, confirma e cancela o encontro", async () => {
    await useCases.propose("aceito", { pointName: PRACA, scheduledAt: new Date(2026, 9, 23, 10).toISOString() }, "dono");
    const hook = await renderMeeting("leitora");
    expect(hook.current[0].meeting?.status).toBe("proposed");
    await act(async () => { expect(await hook.current[1].confirm()).toBe(true); });
    expect(hook.current[0].meeting?.status).toBe("confirmed");
    await act(async () => { expect(await hook.current[1].cancel()).toBe(true); });
    expect(hook.current[0].meeting?.status).toBe("cancelled");
  });

  it("explica por que quem convidou não confirma e limita tentativas", async () => {
    await useCases.propose("aceito", { pointName: PRACA, scheduledAt: new Date(2026, 9, 23, 10).toISOString() }, "dono");
    const hook = await renderMeeting("dono");
    await act(async () => { expect(await hook.current[1].confirm()).toBe(false); });
    expect(hook.current[0].actionError).toMatch(/não pode confirmá-lo/);
    await act(async () => { await hook.current[1].confirm(); await hook.current[1].confirm(); });
    await act(async () => { expect(await hook.current[1].confirm()).toBe(false); });
    expect(hook.current[0].actionError).toMatch(/Muitas tentativas/);
  });

  it("sem encontro, não faz nada; erro de carga vira mensagem", async () => {
    const hook = await renderMeeting("dono");
    expect(hook.current[0].meeting).toBeNull();
    await act(async () => { expect(await hook.current[1].cancel()).toBe(false); });
    const failing = { ...useCases, getMeeting: vi.fn().mockRejectedValue(new Error("rede")) } as unknown as IMeetingUseCases;
    const broken = await renderMeeting("dono", failing);
    expect(broken.current[0].error).toMatch(/Não foi possível carregar/);
  });
});
