import { cleanup, render, waitFor } from "@testing-library/react-native";
import { AccessibilityInfo, Platform, StyleSheet, Text } from "react-native";
import { Chip } from "@/view/components/Chip";
import { FilledButton } from "@/view/components/FilledButton";
import { IosCardSurface } from "@/view/components/IosCardSurface";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ReaderCard } from "@/view/components/ReaderCard";
import { TextField } from "@/view/components/TextField";
import { colors, tokens } from "@/view/tokens";

describe("Design System iPhone · botões, cards e formulários (Spec 137)", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.restoreAllMocks();
  });

  it("mantém o card de papel opaco, arredondado e acessível no iOS", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const screen = await render(
      <IosCardSurface variant="paper" testID="paper"><Text>Livro</Text></IosCardSurface>,
    );
    const style = StyleSheet.flatten(screen.getByTestId("paper").props.style);
    expect(style.backgroundColor).toBe(colors.m3.surfaceContainerLowest);
    expect(style.borderRadius).toBe(tokens.radius.xl);
    expect(screen.queryByTestId("ios-card-blur")).toBeNull();
  });

  it("exibe desfoque no vidro e desativa-o ao reduzir a transparência", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(true);
    const screen = await render(
      <IosCardSurface variant="glass" testID="glass"><Text>Conteúdo</Text></IosCardSurface>,
    );
    await waitFor(() => {
      const style = StyleSheet.flatten(screen.getByTestId("glass").props.style);
      expect(style.backgroundColor).toBe(colors.m3.surfaceContainerLow);
      expect(screen.queryByTestId("ios-card-blur")).toBeNull();
    });
  });

  it("usa superfície de vidro translúcida no iOS quando a redução está desligada", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
    const screen = await render(
      <IosCardSurface variant="glass" testID="glass"><Text>Conteúdo</Text></IosCardSurface>,
    );
    const style = StyleSheet.flatten(screen.getByTestId("glass").props.style);
    expect(style.backgroundColor).toBe(tokens.glass.fill);
    expect(screen.getByTestId("ios-card-blur")).toBeDefined();
  });

  it("não altera a superfície nem aplica blur no Android", async () => {
    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
    const screen = await render(
      <IosCardSurface variant="glass" testID="native"><Text>Conteúdo</Text></IosCardSurface>,
    );
    const style = StyleSheet.flatten(screen.getByTestId("native").props.style);
    expect(style?.backgroundColor).toBeUndefined();
    expect(screen.queryByTestId("ios-card-blur")).toBeNull();
  });

  it("preserva o cartão de leitor e a sua descrição acessível", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const screen = await render(<ReaderCard name="Maria" subtitle="Centro, Piripiri" />);
    expect(screen.getByLabelText("Cartão de leitor de Maria")).toBeDefined();
    expect(screen.getByText("Centro, Piripiri")).toBeDefined();
  });

  it("usa botão secundário de vidro e botão principal com alvo preservado no iOS", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    jest.spyOn(AccessibilityInfo, "isReduceTransparencyEnabled").mockResolvedValue(false);
    const secondary = await render(<OutlinedButton label="Ver detalhes" onPress={() => {}} />);
    expect(secondary.getByTestId("outlined-button-blur")).toBeDefined();
    const primary = await render(<FilledButton label="Continuar" onPress={() => {}} />);
    const style = StyleSheet.flatten(primary.getByRole("button").props.style);
    expect(style.minHeight).toBe(52);
    expect(style.borderRadius).toBe(tokens.radius.full);
  });

  it("mantém o rótulo do campo e o filtro selecionado acessíveis no iOS", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const field = await render(<TextField label="E-mail" value="" onChangeText={() => {}} />);
    expect(field.getByLabelText("E-mail")).toBeDefined();
    const chip = await render(<Chip label="Venda" selected onPress={() => {}} />);
    const control = chip.getByRole("checkbox");
    const style = StyleSheet.flatten(control.props.style);
    expect(style.minHeight).toBe(44);
    expect(style.borderRadius).toBe(tokens.radius.full);
    expect(control.props.accessibilityState.checked).toBe(true);
  });
});
