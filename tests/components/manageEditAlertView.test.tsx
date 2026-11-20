Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Platform, StyleSheet } from "react-native";
import { searchAlertUseCases } from "@/di/container";
import EditAlert from "@/view/search/editAlert";
import ManageAlert from "@/view/search/manageAlert";
import * as HapticsModule from "@/view/haptics";
import { contrastRatio } from "@/view/theme/contrastRatio";
import { colors, tokens } from "@/view/tokens";

const cjsPlatform = require("../mocks/react-native.cjs").Platform;
function setPlatformOS(os: typeof Platform.OS) {
  Platform.OS = os;
  (Platform as any).select = (obj: any) => obj[os] ?? obj.default;
  cjsPlatform.OS = os;
  cjsPlatform.select = (obj: any) => obj[os] ?? obj.default;
}

describe("gerenciamento de alertas (Spec 036, Spec 137 / Issue #229)", () => {
  const originalPlatform = Platform.OS;

  afterEach(async () => {
    await act(async () => cleanup());
    setPlatformOS(originalPlatform);
    jest.restoreAllMocks();
  });

  it("exige modalidade e salva termo e tipos escolhidos com feedback tátil no iOS", async () => {
    setPlatformOS("ios");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-edita-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Machado");
    const onSaved = jest.fn();
    const onBack = jest.fn();
    const screen = await render(<EditAlert alertId={alert.id} userId={userId} onBack={onBack} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByRole("header", { name: "Ajuste sua busca." })).toBeDefined());
    expect(screen.getByLabelText("Cidade").props.editable).toBe(false);
    expect(screen.getByLabelText("Cidade").props.value).toBe("Piripiri, PI");

    for (const label of ["Venda", "Troca", "Doação"]) {
      await act(async () => {
        fireEvent.press(screen.getByRole("checkbox", { name: `Tipo ${label}` }));
      });
      expect(screen.getByRole("checkbox", { name: `Tipo ${label}` }).props.accessibilityState.checked).toBe(false);
    }
    expect(triggerHapticSpy).toHaveBeenCalledWith("selection");

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Salvar alterações" }));
    });
    await waitFor(() => expect(screen.getByRole("alert").props.children).toBe("Selecione pelo menos um tipo."));
    expect(triggerHapticSpy).toHaveBeenCalledWith("error");
    expect(onSaved).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole("checkbox", { name: "Tipo Venda" }));
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("O que você procura?"), "Iracema");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Salvar alterações" }));
    });
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(triggerHapticSpy).toHaveBeenCalledWith("success");
    expect((await searchAlertUseCases.listAlerts(userId))[0]).toMatchObject({ query: "Iracema", modalities: ["sale"] });
  });

  it("cancela edição do alerta chamando onBack com feedback tátil no iOS", async () => {
    setPlatformOS("ios");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-edita-cancel-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Dom Casmurro");
    const onSaved = jest.fn();
    const onBack = jest.fn();
    const screen = await render(<EditAlert alertId={alert.id} userId={userId} onBack={onBack} onSaved={onSaved} />);
    await waitFor(() => expect(screen.getByRole("header", { name: "Ajuste sua busca." })).toBeDefined());

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("light");
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSaved).not.toHaveBeenCalled();
  });

  it("cancela o diálogo de exclusão preservando o alerta no iOS", async () => {
    setPlatformOS("ios");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-gerencia-cancel-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Helena");
    const onDeleted = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ManageAlert alertId={alert.id} userId={userId} onBack={jest.fn()} onEditAlert={jest.fn()} onAlertDeleted={onDeleted} />
      );
    });
    expect(screen.getByText("Alerta ativo")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir alerta Helena" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("light");
    expect(screen.getByText("Excluir este alerta?")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("light");
    await waitFor(() => expect(screen.queryByText("Excluir este alerta?")).toBeNull());
    expect(await searchAlertUseCases.listAlerts(userId)).toHaveLength(1);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("não dispara feedback tátil no Android ao cancelar edição do alerta", async () => {
    setPlatformOS("android");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-android-edit-036";
    const alert = await searchAlertUseCases.createAlert(userId, "O Guarani");
    const onBack = jest.fn();

    const screen = await render(
      <EditAlert alertId={alert.id} userId={userId} onBack={onBack} onSaved={jest.fn()} />
    );
    await waitFor(() => expect(screen.getByRole("header", { name: "Ajuste sua busca." })).toBeDefined());

    await act(async () => {
      fireEvent.press(screen.getByRole("checkbox", { name: "Tipo Venda" }));
    });
    expect(triggerHapticSpy).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Cancelar" }));
    });
    expect(triggerHapticSpy).not.toHaveBeenCalled();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("não dispara feedback tátil no Android e mantém cantos padrão do Material 3 ao gerenciar alertas", async () => {
    setPlatformOS("android");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-android-manage-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Iracema");
    const onDeleted = jest.fn();
    const onEdit = jest.fn();
    const onBack = jest.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ManageAlert alertId={alert.id} userId={userId} onBack={onBack} onEditAlert={onEdit} onAlertDeleted={onDeleted} />
      );
    });
    await waitFor(() => expect(screen.getByText("Alerta ativo")).toBeDefined());

    const cardStyle = StyleSheet.flatten(screen.getByTestId("manage-alert-status-card").props.style);
    expect(cardStyle.borderRadius).toBe(tokens.radius.medium);
    expect(cardStyle.borderCurve).toBeUndefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Pausar alerta Iracema" }));
    });
    expect(triggerHapticSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Alerta pausado")).toBeDefined());

    fireEvent.press(screen.getByRole("button", { name: "Editar alerta Iracema" }));
    expect(triggerHapticSpy).not.toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledWith(alert.id);
  });

  it("pausa, retoma e só exclui após confirmação com cantos contínuos no iOS", async () => {
    setPlatformOS("ios");
    const triggerHapticSpy = jest.spyOn(HapticsModule, "triggerHaptic").mockImplementation(() => {});
    const userId = "usuario-gerencia-036";
    const alert = await searchAlertUseCases.createAlert(userId, "Machado");
    const onDeleted = jest.fn();
    const onEdit = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ManageAlert alertId={alert.id} userId={userId} onBack={jest.fn()} onEditAlert={onEdit} onAlertDeleted={onDeleted} />
      );
    });
    await waitFor(() => expect(screen.getByText("Alerta ativo")).toBeDefined());
    const activeCardStyle = StyleSheet.flatten(screen.getByTestId("manage-alert-status-card").props.style);
    const activeTitleStyle = StyleSheet.flatten(screen.getByText("Alerta ativo").props.style);
    const activeBodyStyle = StyleSheet.flatten(
      screen.getByText("Você será avisado quando um livro combinar com esta busca.").props.style,
    );
    expect(activeCardStyle.backgroundColor).toBe(colors.m3.primaryContainer);
    expect(activeCardStyle.borderRadius).toBe(tokens.radius.card);
    expect(activeCardStyle.borderCurve).toBe("continuous");
    expect(activeTitleStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(activeBodyStyle.color).toBe(colors.m3.onPrimaryContainer);
    expect(contrastRatio(activeTitleStyle.color as string, activeCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(activeBodyStyle.color as string, activeCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Pausar alerta Machado" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
    expect(screen.getByText("Alerta pausado")).toBeDefined();
    const pausedCardStyle = StyleSheet.flatten(screen.getByTestId("manage-alert-status-card").props.style);
    const pausedTitleStyle = StyleSheet.flatten(screen.getByText("Alerta pausado").props.style);
    expect(pausedCardStyle.backgroundColor).toBe(colors.m3.surfaceContainerHigh);
    expect(pausedCardStyle.borderRadius).toBe(tokens.radius.card);
    expect(pausedCardStyle.borderCurve).toBe("continuous");
    expect(pausedTitleStyle.color).toBe(colors.text);
    expect(contrastRatio(pausedTitleStyle.color as string, pausedCardStyle.backgroundColor as string)).toBeGreaterThanOrEqual(4.5);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Retomar alerta Machado" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
    expect(screen.getByText("Alerta ativo")).toBeDefined();

    fireEvent.press(screen.getByRole("button", { name: "Editar alerta Machado" }));
    expect(triggerHapticSpy).toHaveBeenCalledWith("selection");
    expect(onEdit).toHaveBeenCalledWith(alert.id);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir alerta Machado" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("light");
    expect(screen.getByText("Excluir este alerta?")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Confirmar exclusão" }));
    });
    expect(triggerHapticSpy).toHaveBeenCalledWith("warning");
    expect(await searchAlertUseCases.listAlerts(userId)).toHaveLength(0);
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
  });
});
