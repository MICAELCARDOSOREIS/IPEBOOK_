import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Meeting } from "@/model/entities/meeting";
import type { UserMeetingsState, UserMeetingsActions } from "@/viewmodel/useUserMeetingsViewModel";
import MeetingHistory from "@/view/profile/meetingHistory";

vi.mock("@/viewmodel/useUserMeetingsViewModel", () => ({
  useUserMeetingsViewModel: vi.fn(),
}));
vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(() => [{ user: { id: "user1" }, loading: false, error: null }]),
}));

import { useUserMeetingsViewModel } from "@/viewmodel/useUserMeetingsViewModel";

afterEach(async () => {
  await act(async () => cleanup());
});

function mockViewModel(state: UserMeetingsState, actions: Partial<UserMeetingsActions> = {}) {
  const fullActions: UserMeetingsActions = { reload: vi.fn().mockResolvedValue(undefined), ...actions };
  vi.mocked(useUserMeetingsViewModel).mockReturnValue([state, fullActions]);
  return fullActions;
}

const sabado15h = new Date(2026, 9, 24, 15).toISOString();
const meetingRealizado: Meeting = {
  id: "m1",
  requestId: "req1",
  pointName: "Praça da Bandeira (Centro)",
  scheduledAt: "2026-10-20T10:00:00.000Z", // no passado
  proposedBy: "user1",
  status: "confirmed",
};
const meetingConfirmado: Meeting = {
  id: "m2",
  requestId: "req2",
  pointName: "Campus IFPI Piripiri (Recepção ou Biblioteca)",
  scheduledAt: sabado15h,
  proposedBy: "outro",
  status: "confirmed",
};
const meetingCancelado: Meeting = {
  id: "m3",
  requestId: "req3",
  pointName: "Praça de Eventos",
  scheduledAt: sabado15h,
  proposedBy: "user1",
  status: "cancelled",
};

describe("MeetingHistory (Spec 071)", () => {
  it("exibe carregando e erro com ação de recarregar", async () => {
    mockViewModel({ meetings: [], loading: true, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MeetingHistory />);
    });
    expect(screen.getByLabelText("Carregando encontros…")).toBeDefined();

    const actions = mockViewModel({ meetings: [], loading: false, error: "Falha de rede" });
    await act(async () => {
      screen = await render(<MeetingHistory />);
    });
    expect(screen.getByText("Falha de rede")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));
    });
    expect(actions.reload).toHaveBeenCalledOnce();
  });

  it("exibe estado vazio quando o usuário não tiver encontros", async () => {
    mockViewModel({ meetings: [], loading: false, error: null });
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MeetingHistory />);
    });
    expect(screen.getByText("Nenhum encontro registrado")).toBeDefined();
    expect(screen.getByText(/4 pontos seguros de Piripiri/)).toBeDefined();
  });

  it("lista encontros realizados, confirmados e cancelados e permite navegar para a negociação", async () => {
    mockViewModel({ meetings: [meetingConfirmado, meetingRealizado, meetingCancelado], loading: false, error: null });
    const onNavigateToNegotiation = vi.fn();
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <MeetingHistory onBack={onBack} onNavigateToNegotiation={onNavigateToNegotiation} />,
      );
    });

    expect(screen.getByText("3 encontros registrados nos pontos públicos de Piripiri")).toBeDefined();
    expect(screen.getByText("Campus IFPI Piripiri (Recepção ou Biblioteca)")).toBeDefined();
    expect(screen.getByText("Praça da Bandeira (Centro)")).toBeDefined();
    expect(screen.getByText("Praça de Eventos")).toBeDefined();

    expect(screen.getAllByText("Realizado").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cancelado").length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(screen.getAllByRole("button", { name: /Encontro em/ })[0]);
    });
    expect(onNavigateToNegotiation).toHaveBeenCalledWith("req2");

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Voltar" }));
    });
    expect(onBack).toHaveBeenCalledOnce();
  });
});
