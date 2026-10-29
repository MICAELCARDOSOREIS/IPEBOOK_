import React from "react";
import { act, cleanup, fireEvent, render, within } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Meeting } from "@/model/entities/meeting";
import type { MeetingActions, MeetingState } from "@/viewmodel/useMeetingViewModel";
import type { ScheduleMeetingActions, ScheduleMeetingState } from "@/viewmodel/useScheduleMeetingViewModel";
import { MeetingCard } from "@/view/requests/meetingCard";
import ScheduleMeetingScreen, { ScheduleMeeting } from "@/view/requests/scheduleMeeting";

vi.mock("@/viewmodel/useMeetingViewModel", () => ({ useMeetingViewModel: vi.fn() }));
vi.mock("@/viewmodel/useScheduleMeetingViewModel", () => ({ useScheduleMeetingViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useMeetingViewModel } from "@/viewmodel/useMeetingViewModel";
import { useScheduleMeetingViewModel } from "@/viewmodel/useScheduleMeetingViewModel";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

// Desmonta cada árvore: um diálogo modal aberto esconderia as telas dos testes seguintes.
afterEach(async () => {
  await act(async () => cleanup());
});

const sabado15h = new Date(2026, 9, 24, 15).toISOString();
const baseMeeting: Meeting = {
  id: "m1",
  requestId: "r1",
  pointName: "Praça da Bandeira (Centro)",
  scheduledAt: sabado15h,
  proposedBy: "dono",
  status: "proposed",
};

function mockMeeting(state: Partial<MeetingState>, actions: Partial<MeetingActions> = {}) {
  const full: MeetingActions = { reload: vi.fn(), confirm: vi.fn().mockResolvedValue(true), cancel: vi.fn().mockResolvedValue(true), ...actions };
  vi.mocked(useMeetingViewModel).mockReturnValue([
    { meeting: null, loading: false, error: null, busy: false, actionError: null, ...state },
    full,
  ]);
  return full;
}

async function renderCard(userId: string, onScheduleMeeting = vi.fn()) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(
      <MeetingCard requestId="r1" sessionUserId={userId} counterpartName="Ana Paula" onScheduleMeeting={onScheduleMeeting} />,
    );
  });
  return screen;
}

describe("cartão do encontro (Spec 052, 06.05/06.11/06.12)", () => {
  it("sem convite, oferece Combinar encontro", async () => {
    mockMeeting({ meeting: null });
    const onSchedule = vi.fn();
    const screen = await renderCard("dono", onSchedule);
    expect(screen.getByRole("header", { name: "Combine o encontro" })).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Combinar encontro" })); });
    expect(onSchedule).toHaveBeenCalledOnce();
  });

  it("convite da outra pessoa: mostra quando e onde e permite confirmar", async () => {
    const actions = mockMeeting({ meeting: baseMeeting });
    const screen = await renderCard("leitora");
    expect(screen.getByRole("header", { name: "Convite para encontro" })).toBeDefined();
    expect(screen.getByText("Ana Paula sugeriu este encontro.")).toBeDefined();
    expect(screen.getByText("Sáb, 24/10 · 15h")).toBeDefined();
    expect(screen.getByText("Praça da Bandeira, Centro, Piripiri, PI")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Confirmar encontro" })); });
    expect(actions.confirm).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Sugerir outro horário" })).toBeDefined();
  });

  it("quem convidou aguarda e não vê confirmar (RN-05)", async () => {
    mockMeeting({ meeting: baseMeeting });
    const screen = await renderCard("dono");
    expect(screen.getByRole("header", { name: "Aguardando confirmação" })).toBeDefined();
    expect(screen.getByText("Ana Paula ainda precisa confirmar este encontro.")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Confirmar encontro" })).toBeNull();
    expect(screen.getByRole("button", { name: "Reagendar" })).toBeDefined();
  });

  it("encontro combinado: reagendar e cancelar só depois de confirmar no diálogo (06.11)", async () => {
    const actions = mockMeeting({ meeting: { ...baseMeeting, status: "confirmed" } });
    const onSchedule = vi.fn();
    const screen = await renderCard("leitora", onSchedule);
    expect(screen.getByRole("header", { name: "Encontro combinado" })).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Reagendar" })); });
    expect(onSchedule).toHaveBeenCalledOnce();

    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Cancelar encontro" })); });
    expect(actions.cancel).not.toHaveBeenCalled();
    expect(screen.getByText("Ana Paula receberá um aviso. Vocês poderão combinar outro dia.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Manter encontro" })); });
    expect(actions.cancel).not.toHaveBeenCalled();
    expect(screen.queryByText("Cancelar este encontro?")).toBeNull();

    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Cancelar encontro" })); });
    // Com o diálogo aberto, só a ação dele fica acessível (o fundo é modal).
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Cancelar encontro" })); });
    expect(actions.cancel).toHaveBeenCalledOnce();
  });

  it("cancelado: avisa e oferece novo convite (06.12); erros aparecem como alerta", async () => {
    mockMeeting({ meeting: { ...baseMeeting, status: "cancelled" }, actionError: "Muitas tentativas seguidas." });
    const screen = await renderCard("dono");
    expect(screen.getByRole("header", { name: "Encontro cancelado" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Combinar novo encontro" })).toBeDefined();
    expect(screen.getByRole("alert").props.children).toBe("Muitas tentativas seguidas.");
  });

  it("carregando e erro de carga com nova tentativa", async () => {
    mockMeeting({ loading: true });
    expect((await renderCard("dono")).getByText("Carregando o encontro…")).toBeDefined();
    const actions = mockMeeting({ error: "Você não participa desta negociação." });
    const screen = await renderCard("dono");
    expect(screen.getByRole("alert").props.children).toBe("Você não participa desta negociação.");
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" })); });
    expect(actions.reload).toHaveBeenCalledOnce();
  });
});

const dias = [new Date(2026, 9, 23), new Date(2026, 9, 24)];

function mockSchedule(state: Partial<ScheduleMeetingState>, submit = vi.fn().mockResolvedValue(true)) {
  const actions: ScheduleMeetingActions = { selectPoint: vi.fn(), selectDay: vi.fn(), selectHour: vi.fn(), submit };
  vi.mocked(useScheduleMeetingViewModel).mockReturnValue([
    {
      mode: "propose", loading: false, loadError: null, pointName: null, dayIndex: null, hour: null,
      dayOptions: dias, timeSlots: [9, 10, 15, 17], submitting: false, error: null, ...state,
    },
    actions,
  ]);
  return actions;
}

describe("combinar e reagendar encontro (Spec 052, 06.04/06.13)", () => {
  it("06.04: escolhas de opção única e Enviar convite", async () => {
    const actions = mockSchedule({ pointName: "Praça da Bandeira (Centro)", dayIndex: 1, hour: 15 });
    const onSent = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ScheduleMeeting requestId="r1" sessionUserId="dono" onSent={onSent} />); });

    expect(screen.getByRole("header", { name: "Combinar encontro" })).toBeDefined();
    const dia = within(screen.getByLabelText("Dia do encontro"));
    expect(dia.getByRole("radio", { name: "Dia sábado, 24/10" }).props.accessibilityState).toMatchObject({ checked: true });
    expect(dia.getByText("Sex, 23/10")).toBeDefined();
    expect(screen.getByRole("radio", { name: "Horário 15h" }).props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByRole("radio", { name: /^Local Praça da Bandeira/ }).props.accessibilityState).toMatchObject({ checked: true });

    await act(async () => { fireEvent.press(screen.getByRole("radio", { name: /^Local Praça de Eventos/ })); });
    await act(async () => { fireEvent.press(screen.getByRole("radio", { name: "Dia sexta-feira, 23/10" })); });
    await act(async () => { fireEvent.press(screen.getByRole("radio", { name: "Horário 9h" })); });
    expect(actions.selectPoint).toHaveBeenCalledWith("Praça de Eventos");
    expect(actions.selectDay).toHaveBeenCalledWith(0);
    expect(actions.selectHour).toHaveBeenCalledWith(9);

    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Enviar convite" })); });
    expect(actions.submit).toHaveBeenCalledOnce();
    expect(onSent).toHaveBeenCalledOnce();
  });

  it("06.13: reagendar com manchete, Enviar nova sugestão e Cancelar", async () => {
    mockSchedule({ mode: "reschedule", error: "Escolha um dos horários sugeridos." }, vi.fn().mockResolvedValue(false));
    const onBack = vi.fn();
    const onSent = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ScheduleMeeting requestId="r1" sessionUserId="leitora" onBack={onBack} onSent={onSent} />); });
    expect(screen.getByRole("header", { name: "Reagendar encontro" })).toBeDefined();
    expect(screen.getByRole("header", { name: "Encontre um novo horário." })).toBeDefined();
    expect(screen.getByRole("alert").props.children).toBe("Escolha um dos horários sugeridos.");
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Enviar nova sugestão" })); });
    expect(onSent).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Cancelar" })); });
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("carregando, erro de carga e exigência de sessão", async () => {
    mockSchedule({ loading: true });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ScheduleMeeting requestId="r1" sessionUserId="dono" />); });
    expect(screen.getByLabelText("Carregando o encontro")).toBeDefined();

    mockSchedule({ loadError: "Você não participa desta negociação." });
    await act(async () => { screen = await render(<ScheduleMeeting requestId="r1" sessionUserId="intrusa" />); });
    expect(screen.getByText("Você não participa desta negociação.")).toBeDefined();

    vi.mocked(useAuthViewModel).mockReturnValue([
      { user: null, loading: false, error: null },
      { signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ] as never);
    const onRequireSignIn = vi.fn();
    await act(async () => { await render(<ScheduleMeetingScreen requestId="r1" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledOnce();
  });
});
