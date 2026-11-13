
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { describe, expect, it, vi } from "vitest";
import { searchAlertUseCases } from "@/di/container";
import EditAlert from "@/view/search/editAlert";
import ManageAlert from "@/view/search/manageAlert";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors } from "@/view/tokens";

describe("gerenciamento de alertas (Spec 036)", () => {
  it("exige modalidade e salva termo e tipos escolhidos", async () => {
    const userId = "usuario-edita-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Machado");
    const onSaved = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    screen = await render(<EditAlert alertId={alert.id} userId={userId} onBack={vi.fn()} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByRole("header", { name: "Ajuste sua busca." })).toBeDefined());
    expect(screen.getByLabelText("Cidade").props.editable).toBe(false);
    expect(screen.getByLabelText("Cidade").props.value).toBe("Piripiri, PI");
    for (const label of ["Venda", "Troca", "Doação"]) {
      await act(async () => { fireEvent.press(screen.getByRole("checkbox", { name: `Tipo ${label}` })); });
      expect(screen.getByRole("checkbox", { name: `Tipo ${label}` }).props.accessibilityState.checked).toBe(false);
    }
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Salvar alterações" })); });
    await waitFor(() => expect(screen.getByRole("alert").props.children).toBe("Selecione pelo menos um tipo."));
    expect(onSaved).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByRole("checkbox", { name: "Tipo Venda" })); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("O que você procura?"), "Iracema"); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Salvar alterações" })); });
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect((await searchAlertUseCases.listAlerts(userId))[0]).toMatchObject({ query: "Iracema", modalities: ["sale"] });
  });
  it("pausa, retoma e só exclui após confirmação", async () => {
    const userId = "usuario-gerencia-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Machado");
    const onDeleted = vi.fn();
    const onEdit = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ManageAlert alertId={alert.id} userId={userId} onBack={vi.fn()} onEditAlert={onEdit} onAlertDeleted={onDeleted} />); });
    expect(screen.getByText("Alerta ativo")).toBeDefined();
    const activeCardStyle = StyleSheet.flatten(screen.getByTestId("manage-alert-status-card").props.style);
    const activeTitleStyle = StyleSheet.flatten(screen.getByText("Alerta ativo").props.style);
    const activeBodyStyle = StyleSheet.flatten(
      screen.getByText("Você será avisado quando um livro combinar com esta busca.").props.style,
    );
    expect(activeCardStyle.backgroundColor).toBe(colors.m3.primaryContainer);
    expect(activeTitleStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(activeBodyStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(contrastRatio(activeTitleStyle.color as string, activeCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(activeBodyStyle.color as string, activeCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);

    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Pausar alerta Machado" })); });
    expect(screen.getByText("Alerta pausado")).toBeDefined();
    const pausedCardStyle = StyleSheet.flatten(screen.getByTestId("manage-alert-status-card").props.style);
    const pausedTitleStyle = StyleSheet.flatten(screen.getByText("Alerta pausado").props.style);
    expect(pausedCardStyle.backgroundColor).toBe(colors.m3.surfaceContainerHigh);
    expect(pausedTitleStyle.color).toBe(colors.text);
    expect(contrastRatio(pausedTitleStyle.color as string, pausedCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Retomar alerta Machado" })); });
    expect(screen.getByText("Alerta ativo")).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Editar alerta Machado" }));
    expect(onEdit).toHaveBeenCalledWith(alert.id);
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Excluir alerta Machado" })); });
    expect(screen.getByText("Excluir este alerta?")).toBeDefined();
    expect(await searchAlertUseCases.listAlerts(userId)).toHaveLength(1);
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Confirmar exclusão" })); });
    expect(await searchAlertUseCases.listAlerts(userId)).toHaveLength(0);
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce());
  });


});
