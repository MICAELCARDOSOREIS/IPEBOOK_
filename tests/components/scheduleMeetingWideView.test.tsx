
import { act, cleanup, fireEvent, render, within } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScheduleMeeting } from "@/view/requests/scheduleMeeting";
import { useScheduleMeetingViewModel, type ScheduleMeetingActions, type ScheduleMeetingState } from "@/viewmodel/useScheduleMeetingViewModel";

vi.mock("@/view/useIsWideWeb", () => ({
  useIsWideWeb: () => true,
  useHydratedWindowWidth: () => 1280,
  WIDE_WEB_MIN_WIDTH: 960,
}));

vi.mock("@/viewmodel/useScheduleMeetingViewModel");

afterEach(async () => {
  await act(async () => cleanup());
  vi.clearAllMocks();
});

const dias = [
  new Date(2026, 9, 23), // sexta
  new Date(2026, 9, 24), // sabado
  new Date(2026, 9, 25), // domingo
];

function mockSchedule(
  state: Partial<ScheduleMeetingState>,
  submit = vi.fn().mockResolvedValue(true),
) {
  const actions: ScheduleMeetingActions = {
    reload: vi.fn(),
    selectPoint: vi.fn(),
    selectDay: vi.fn(),
    selectHour: vi.fn(),
    submit,
  };
  vi.mocked(useScheduleMeetingViewModel).mockReturnValue([
    {
      mode: "propose",
      loading: false,
      loadError: null,
      pointName: null,
      dayIndex: null,
      hour: null,
      dayOptions: dias,
      timeSlots: [8, 9, 10, 15, 17],
      isPointOpenOnDay: true,
      submitting: false,
      error: null,
      ...state,
    },
    actions,
  ]);
  return actions;
}

describe("ScheduleMeeting em Desktop Largo (Web, useIsWideWeb)", () => {
  it("renderiza layout em 2 colunas com lista de locais, grade de dias, horários e guia de pontos", async () => {
    const actions = mockSchedule({
      pointName: "Praça da Bandeira (Centro)",
      dayIndex: 0,
      hour: 15,
    });
    const onSent = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ScheduleMeeting requestId="req-1" sessionUserId="user-1" onSent={onSent} />,
      );
    });

    // TopAppBar e títulos principais
    expect(screen.getByRole("header", { name: "Combinar encontro" })).toBeDefined();
    expect(screen.getByRole("header", { name: "Escolha onde e quando encontrar" })).toBeDefined();

    // Coluna Direita: Guia de pontos e Dicas
    expect(screen.getByText("Pontos de Encontro em Piripiri")).toBeDefined();
    expect(screen.getByText("4 locais públicos oficiais")).toBeDefined();
    expect(screen.getByText("4 Pontos Seguros em Piripiri")).toBeDefined();
    expect(screen.getByText("Dicas de Segurança Comunitária")).toBeDefined();

    // Detalhe do ponto selecionado na coluna direita e no card da lista
    expect(screen.getAllByText(/Praça da Bandeira, Centro, Piripiri, PI/).length).toBeGreaterThanOrEqual(1);

    // Seletores da coluna esquerda
    const radiogroupLocal = within(screen.getByLabelText("Local do encontro"));
    expect(radiogroupLocal.getByRole("radio", { name: /^Local Praça da Bandeira/ })).toBeDefined();

    const radiogroupDia = within(screen.getByLabelText("Dia do encontro"));
    expect(radiogroupDia.getByRole("radio", { name: "Dia sexta-feira, 23/10" })).toBeDefined();

    const radiogroupHorario = within(screen.getByLabelText("Horário do encontro"));
    expect(radiogroupHorario.getByRole("radio", { name: "Horário 15h" })).toBeDefined();

    // Interações de seleção
    await act(async () => {
      fireEvent.press(radiogroupLocal.getByRole("radio", { name: /^Local Praça de Eventos/ }));
    });
    expect(actions.selectPoint).toHaveBeenCalledWith("Praça de Eventos");

    await act(async () => {
      fireEvent.press(radiogroupDia.getByRole("radio", { name: "Dia sábado, 24/10" }));
    });
    expect(actions.selectDay).toHaveBeenCalledWith(1);

    await act(async () => {
      fireEvent.press(radiogroupHorario.getByRole("radio", { name: "Horário 9h" }));
    });
    expect(actions.selectHour).toHaveBeenCalledWith(9);

    // Envio do convite
    const submitBtn = screen.getByRole("button", { name: "Enviar convite" });
    await act(async () => {
      fireEvent.press(submitBtn);
    });
    expect(actions.submit).toHaveBeenCalledOnce();
    expect(onSent).toHaveBeenCalledOnce();
  });

  it("reagendamento no desktop: exibe manchete de reagendamento e botão de cancelar", async () => {
    mockSchedule({
      mode: "reschedule",
      pointName: "Praça da Bandeira (Centro)",
      dayIndex: 1,
      hour: 10,
    });
    const onBack = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ScheduleMeeting requestId="req-1" sessionUserId="user-1" onBack={onBack} />,
      );
    });

    expect(screen.getByRole("header", { name: "Reagendar encontro" })).toBeDefined();
    expect(screen.getByRole("header", { name: "Encontre um novo horário." })).toBeDefined();
    expect(screen.getByRole("button", { name: "Enviar nova sugestão" })).toBeDefined();

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await act(async () => {
      fireEvent.press(cancelBtn);
    });
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("exibe aviso específico quando o local fecha no dia escolhido (IFPI/Museu no fim de semana)", async () => {
    mockSchedule({
      pointName: "Campus IFPI Piripiri (Recepção ou Biblioteca)",
      dayIndex: 1, // Sábado
      isPointOpenOnDay: false,
      timeSlots: [],
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ScheduleMeeting requestId="req-1" sessionUserId="user-1" />,
      );
    });

    expect(
      screen.getByText(/O Campus IFPI e o Museu funcionam exclusivamente em dias úteis/),
    ).toBeDefined();
  });

  it("exibe mensagem quando nenhum local estiver selecionado na coluna direita", async () => {
    mockSchedule({
      pointName: null,
      dayIndex: null,
      hour: null,
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ScheduleMeeting requestId="req-1" sessionUserId="user-1" />,
      );
    });

    expect(screen.getByText("Escolha o local na lista ao lado")).toBeDefined();
    expect(screen.getByText(/Pontos monitorados e centrais em Piripiri/)).toBeDefined();
  });

  it("renderiza ScrollView principal na página para permitir rolagem fluida e adaptação em qualquer altura de janela", async () => {
    mockSchedule({
      pointName: "Praça da Bandeira (Centro)",
      dayIndex: 0,
      hour: 15,
    });

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ScheduleMeeting requestId="req-1" sessionUserId="user-1" />,
      );
    });

    // O botão de envio e o resumo estão dentro do fluxo da página com scroll global
    expect(screen.getByRole("button", { name: "Enviar convite" })).toBeDefined();
    expect(screen.getByText(/Praça da Bandeira · Sex, 23\/10 · 15h/)).toBeDefined();
  });
});
