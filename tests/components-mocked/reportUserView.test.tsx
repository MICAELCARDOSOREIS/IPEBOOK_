import type React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import ReportUser from "@/view/listings/reportUser";

jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useReportUserViewModel", () => ({ useReportUserViewModel: jest.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useReportUserViewModel, type ReportUserState } from "@/viewmodel/useReportUserViewModel";

const actions = { setReason: jest.fn(), setDetails: jest.fn(), submit: jest.fn().mockResolvedValue(true) };

function setup(signedIn: boolean, state: Partial<ReportUserState> = {}) {
  jest.mocked(useAuthViewModel).mockReturnValue([
    { user: signedIn ? { id: "me", email: "me@x.com" } : null, loading: false, error: null },
    {} as ReturnType<typeof useAuthViewModel>[1],
  ]);
  jest.mocked(useReportUserViewModel).mockReturnValue([
    { reason: null, details: "", loading: false, error: null, success: false, ...state },
    actions,
  ]);
}

async function renderView(props: Partial<React.ComponentProps<typeof ReportUser>> = {}) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<ReportUser userId="ana" userName="Ana Paula" onBack={() => {}} {...props} />);
  });
  return screen;
}

describe("ReportUser — denunciar pessoa (Spec 091)", () => {
  it("cobre formulário, sem nome, sem sessão e confirmação", async () => {
    // formulário
    setup(true, { reason: "fake_profile", error: "Selecione um motivo para a denúncia." });
    actions.setReason.mockClear();
    actions.submit.mockClear();
    let screen = await renderView();
    expect(screen.getByText("O que aconteceu com Ana Paula?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Comportamento abusivo")); });
    expect(actions.setReason).toHaveBeenCalledWith("abusive_behavior");
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Detalhes adicionais da denúncia"), "ofendeu"); });
    expect(actions.setDetails).toHaveBeenCalledWith("ofendeu");
    expect(screen.getByText("Selecione um motivo para a denúncia.")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Enviar denúncia")); });
    expect(actions.submit).toHaveBeenCalledWith("ana", "me");
    await screen.unmount();

    // sem nome
    setup(true);
    screen = await renderView({ userName: undefined });
    expect(screen.getByText("O que aconteceu?")).toBeDefined();
    await screen.unmount();

    // sem sessão, com e sem botão de entrar
    setup(false);
    const onNavigateToLogin = jest.fn();
    screen = await renderView({ onNavigateToLogin });
    expect(screen.getByText("Identificação necessária")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Entrar na minha conta")); });
    expect(onNavigateToLogin).toHaveBeenCalledTimes(1);
    await screen.unmount();
    screen = await renderView({ onNavigateToLogin: undefined });
    expect(screen.queryByText("Entrar na minha conta")).toBeNull();
    await screen.unmount();

    // confirmação
    setup(true, { success: true });
    const onBack = jest.fn();
    screen = await renderView({ onBack });
    expect(screen.getByText("Denúncia enviada")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Voltar ao perfil")); });
    expect(onBack).toHaveBeenCalledTimes(1);
    await screen.unmount();
  });
});
